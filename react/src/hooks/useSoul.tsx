// "use client"

// import React, { useState, useEffect, useCallback, createContext, forwardRef } from "react"
// import { create } from 'zustand'
// import { Soul, ActionEvent, SoulOpts } from "@opensouls/soul"
// import { v4 as uuidv4 } from 'uuid';
// import { SoulEvent } from "@opensouls/engine"
// import { ArrowUpIcon, CheckCircledIcon, CodeIcon, Cross1Icon, DiscordLogoIcon, EyeClosedIcon, EyeOpenIcon, FaceIcon, GitHubLogoIcon, OpenInNewWindowIcon, Pencil1Icon, QuestionMarkCircledIcon, ReaderIcon } from "@radix-ui/react-icons";
// import { useHover } from "@uidotdev/usehooks";
// import { useLocalStorage } from "usehooks-ts";
// import { twMerge } from "tailwind-merge";


// const ACTIONS = ["says", "thinks", "does", "ambience", "feels", "metadata"] as const;
// export type ActionType = typeof ACTIONS[number];
// export type SoulState = 'waiting' | 'processing' | 'thinking' | 'speaking';

// export type SoulEditorProps = {
//     devMode: boolean, //whether or not to append a prod or dev-id to the soulId?
// }

// //TODO use getConnectedWebsocket to put multiple souls on the same connection

// export type SoulProps = SoulOpts;

// export type CharacterProps = {
//     name: string,
//     displayName?: string,
//     nameStyle?: string,
//     textStyle?: string,
//     messageStyle?: string,
// }

// export type EnvVarProps = Record<string, string>;
// export type HookProps = Record<string, (evt: ActionEvent) => Promise<void>>;

// export type PerceptionOptions = {
//     sendSilently: boolean,
// }

// export type MessageProps = {
//     content: string,
//     action: ActionType | string,
//     character: CharacterProps,
//     metadata?: any,
//     _timestamp?: number,
//     _uuid?: string,
//     event?: ActionEvent,
// }

// export type SoulSettings = {
//     canHear?: boolean,
//     canSpeak?: boolean,
//     streamPerception?: boolean,
//     code?: string,
// }

// export const PLAYER_CHARACTER: CharacterProps = { name: 'Interlocutor' }
// export const EXAMPLE_MESSAGE: MessageProps = { content: 'HONKKKK!!', action: 'ambience', character: PLAYER_CHARACTER };

// interface WorldState {
//     messages: MessageProps[];
//     room: EnvVarProps;
//     setRoom: (newRoom: EnvVarProps) => void;
//     addEvent: (newMessage: MessageProps) => void;
//     setEvents: (newArray: MessageProps[]) => void;
//     setEvent: (index: number, newMessage: MessageProps) => void;
//     getEvent: (uuid: string) => [MessageProps | null, number];
// }

// const ingestEvent = (newMessage: MessageProps) => {
//     const messageWithTimestampAndUUID: MessageProps = {
//         ...newMessage,
//         _timestamp: newMessage?._timestamp ?? Date.now(),
//         _uuid: newMessage?._uuid ?? uuidv4(),
//     }
//     return messageWithTimestampAndUUID
// }

// export const useSoulRoom = create<WorldState>()((set, get) => ({
//     messages: [],
//     room: {},
//     setRoom: (newRoom) => set((state) => ({ room: newRoom })),
//     addEvent: (newMessage) => set((state) => {
//         const messages = state.messages;
//         // console.log('adding event', newMessage.content);
//         const m = ingestEvent(newMessage);
//         return { messages: [...messages, m] }
//     }),
//     setEvents: (newArray) => set((state) => ({ messages: newArray })),
//     setEvent: (index: number, newMessage: MessageProps) => set((state) => {
//         const messages = [...state.messages];
//         messages[index] = newMessage;
//         return { messages };
//     }),
//     getEvent: (uuid: string) => {
//         //todo make a record w/ uuid
//         const messages = get().messages;
//         const index = messages.findIndex((m) => m._uuid === uuid);
//         if (index === -1) { return [null, -1]; }
//         return [messages[index], index];
//     }
// }))

// export type SoulSimpleProps = {
//     soulProps: SoulProps,
//     character: CharacterProps,
//     initEnv?: EnvVarProps,
//     initHooks?: HookProps,
//     settings?: SoulSettings,
// }


// export const DEFAULT_SOUL_SETTINGS: SoulSettings = {
//     canHear: true,
//     canSpeak: true,
//     streamPerception: false,
// }

// export const DEFAULT_PERCEPTION: PerceptionOptions = {
//     sendSilently: false,
// }

// const soulToURI = (soul: Soul, soulProps: SoulProps) => {
//     //https://souls.chat/chats/neilsonnn/thinking-meme/4ee86bd0-d0eb-4f2f-808e-7ed9bf492925
//     return `https://souls.chat/chats/${soulProps.organization}/${soulProps.blueprint}/${soul.soulId}`;
// }

// const useSoul = ({
//     soulProps: soulProps,
//     character: characterSettings,
//     initEnv = {},
//     initHooks = {},
//     settings = DEFAULT_SOUL_SETTINGS,
// }: SoulSimpleProps) => {

//     const { messages, room, addEvent, setEvent, getEvent } = useSoulRoom();

//     const [state, setState] = useState<SoulState>('waiting');
//     const [hooks, setHooks] = useState(initHooks);
//     const [env, setEnv] = useState(initEnv);
//     const [metadata, setMetadata] = useState<SoulEvent['_metadata']>({});
//     const [character, setCharacter] = useState<CharacterProps>(characterSettings);
//     const [soul, setSoul] = useState<Soul>();
//     const [URI, setURI] = useState<string>('');
//     const [lastMessage, setLocalRoomState] = useState<MessageProps>();
//     const [localMessages, setLocalMessages] = useState<MessageProps[]>([]);

//     function addLocalEvent(newMessage: MessageProps) {
//         const event = ingestEvent(newMessage);
//         setLocalMessages((last) => [...last, event]);
//     }

//     useEffect(() => {

//         const initSoul = new Soul({
//             ...soulProps,
//         });

//         initSoul.connect().then(() => {

//             setSoul(initSoul);

//             const newURI = soulToURI(initSoul, soulProps);
//             setURI(newURI);

//             console.log(character.name, `(${soulProps.blueprint}) [soulID:${initSoul?.soulId}] [soul-engine:${newURI}]`, 'CONNECTED');

//         }).catch((error: any) => {
//             console.error("Error connecting to soul", initSoul, soulProps, error);
//         });

//         return () => {
//             // console.log(soulSettings.blueprint, soulSettings.soulId, 'DISCONNECTED');
//             initSoul.disconnect();
//         };

//     }, [soulProps])

//     const onEvent = (stream: boolean, local: boolean) => async (event: ActionEvent) => {

//         let value = '';

//         if (!stream) {
//             // console.log(event.name, event.action, value, 'not streaming')
//             value = await event.content();
//         }

//         setMetadata((last: SoulEvent['_metadata']) => ({ ...last, ...event._metadata }));

//         let newState: SoulState = 'waiting'

//         if (event.action === 'metadata') {
//             if (event?._metadata === undefined) {
//                 console.error('metadata undefined');
//                 // console.log(JSON.stringify(event, null, 2))
//                 return;
//             }

//             if (event._metadata.state !== undefined) {
//                 const state = event._metadata.state;
//                 newState = state as SoulState;
//             }

//         } else if (event.action === 'thinks') {
//             newState = 'speaking';
//         } else if (event.action === 'says') {
//             newState = 'waiting';
//         } else {
//             newState = 'thinking';
//         }

//         // console.log('newState', newState);
//         setState(newState);

//         // console.log(event.name, event.action, value);
//         const message = ingestAction(event, value);

//         //eventually add this as a `useSoulStore` that the room and the souls both use
//         //local messages are only added to our store 
//         //speaking and other actions get added to the room store

//         // const store = useSyncedStore(soul.store)
//         // const events = store.events
//         // //... in a React.FC
//         // events.filter((e) => e.kind = perception).filter((e).name === rayna)
//         // {e.content}

//         addLocalEvent(message);

//         if (local) {

//         } else {

//             //add message to the global room
//             if (settings.canSpeak !== false) {
//                 addEvent(message);
//             }
//         }

//         if (stream) {

//             // console.log(event.name, event.action, message.content, 'streaming');

//             for await (const txt of event.stream()) {

//                 //undo this garbo soon
//                 if (message._uuid === undefined) { console.error('needs uuid'); return; }
//                 const [m, index] = getEvent(message._uuid);
//                 if (m === undefined) { console.error('could not find message in messages'); return; }

//                 message.content = (message.content + txt).trim();
//                 // console.log(message.content);
//                 setEvent(index, message);

//                 //replace the localmessage by finding the uuid
//                 setLocalMessages((last) => {
//                     const index = last.findIndex((m) => m._uuid === message._uuid);
//                     if (index === -1) { console.error('could not find message in local messages'); return last; }
//                     const newMessage = { ...last[index], content: (last[index].content + txt).trim() };
//                     last[index] = newMessage;
//                     return [...last];
//                 });

//             }

//             // console.log(event.name, event.action, message.content, 'streaming done');
//         }
//     }

//     function ingestAction(event: ActionEvent, content: string) {

//         const message: MessageProps = {
//             ...event,
//             content: content,
//             action: event.action as ActionType,
//             character: character,
//             metadata: event._metadata,
//             event: event,
//             _timestamp: event._timestamp,
//             _uuid: uuidv4(),
//         }

//         return message;
//     }

//     useEffect(() => {
//         if (soul && soul?.connected) {
//             updateEnv(soul, room, env);
//             // expireSoul();
//         }
//     }, [room, soul, env]);

//     useEffect(() => {

//         if (!soul || !soul.connected) { return; }

//         //TODO remove these default hooks eventually
//         const eventHandlers = ACTIONS.reduce((acc, action) => {
//             acc[action] = async (evt) => await onEvent(settings.streamPerception === true, false)(evt);
//             return acc;
//         }, {} as HookProps);

//         ACTIONS.forEach(action => { soul.on(action, eventHandlers[action]); });
//         for (const [hookName, hook] of Object.entries(hooks)) { soul.on(hookName, hook); }

//         return () => {
//             ACTIONS.forEach(action => { soul.off(action, eventHandlers[action]); });
//             for (const [hookName, hook] of Object.entries(hooks)) { soul.off(hookName, hook); }
//         };

//     }, [soul, hooks, character, room]);

//     //takes the global environment (room and combined with the local souls environment)
//     function updateEnv(soul: Soul, room: EnvVarProps, env: EnvVarProps) {

//         const combined = { ...room, ...env };
//         // console.log(character.name, 'ENV', JSON.stringify(combined, null, 2))
//         // send the new env to the soul engine
//         soul.setEnvironment(combined);
//     }

//     //routes new messages to each soul
//     //TODO move this out to its own hook?
//     useEffect(() => {

//         if (!soul || !soul.connected || settings.canHear === false) { return; }
//         let timer = null;

//         if (messages && messages.length > 0) {

//             const newMessage = messages[messages.length - 1];
//             // console.log('newMessage', JSON.stringify(newMessage, null, 2))

//             if (newMessage.action === 'says' && newMessage !== lastMessage && newMessage?.character?.name !== character.name) {

//                 // console.log('create perception for message');
//                 setState('processing');

//                 timer = setTimeout(() => {
//                     // console.log('timer');
//                     // console.log(`${character.name}: New world state`, newMessage.content);

//                     setState('thinking');

//                     setLocalRoomState(newMessage);
//                     sendPerception(newMessage);

//                 }, 500);
//             }
//         }

//         return () => {
//             if (timer) clearTimeout(timer);
//         }

//     }, [soul, messages, character, settings])

//     const sendPerception = useCallback(({ content, character, action = 'says' }: MessageProps, sendingOptions = DEFAULT_PERCEPTION) => {
//         if (!soul) { console.error('no soul!'); return; }

//         const message = { content, character, action };
//         // console.log(character.name.toUpperCase(), 'dispatch', content);

//         if (sendingOptions?.sendSilently !== true) {
//             addLocalEvent(message);
//         }

//         // soul.said(message.character.name, content)
//         soul.dispatch({
//             name: character.name,
//             action: action,
//             content: content,
//         });

//     }, [soul, character]);

//     const addHooks = (newHooks: Record<string, (evt: ActionEvent) => Promise<void>>) => {
//         // console.log('adding hooks', newHooks, JSON.stringify(newHooks, null, 2));
//         setHooks((last) => ({ ...last, ...newHooks }));
//     }

//     return {
//         soul,
//         state,
//         metadata,
//         localMessages,
//         soulProps,
//         character,
//         settings,
//         environment: env,
//         URI,
//         addLocalEvent,
//         sendPerception,
//         addHooks,
//         setCharacter,
//         setEnvironment: setEnv,
//     } as SoulProperties;
// }

// export type SoulProperties = {
//     soul: Soul,
//     state: SoulState,
//     metadata: SoulEvent['_metadata'],
//     localMessages: MessageProps[],
//     soulProps: SoulProps,
//     character: CharacterProps,
//     settings: SoulSettings,
//     environment: EnvVarProps,
//     key: string,
//     URI: string,
//     addLocalEvent: (newMessage: MessageProps) => void,
//     sendPerception: (message: MessageProps, sendingOptions?: PerceptionOptions) => void,
//     addHooks: (newHooks: Record<string, (evt: ActionEvent) => Promise<void>>) => void,
//     setCharacter: (newCharacter: CharacterProps) => void,
//     setEnvironment: (updater: (last: EnvVarProps) => EnvVarProps) => void;

// }

// const BG = forwardRef<HTMLDivElement, { children: React.ReactNode, className?: string }>(({ children, className = '' }, ref) => {
//     const cn = twMerge(`rounded-md bg-black border-[1px] border-gray-800 shadow-2xl`, className);

//     return (
//         <div ref={ref} className={cn}>
//             {children}
//         </div>
//     );
// });

// BG.displayName = 'BG';

// const Button = forwardRef<HTMLButtonElement, { children: React.ReactNode, className?: string, onClick?: () => void }>(({ children, className = '', onClick }, ref) => {
//     const cn = twMerge(`flex flex-row items-center align-middle justify-center opacity-75 hover:opacity-100`, className);

//     return (
//         <button
//             ref={ref}
//             className={cn}
//             onClick={onClick}
//         >
//             {children}
//         </button>
//     );
// });

// Button.displayName = 'Button';

// function IconState(
//     { icon, state, flag, className, children }:
//         { icon: React.ReactNode, state: React.ReactNode, flag: boolean, className?: string, children?: React.ReactNode }) {

//     return (
//         <div className="flex flex-row items-center">
//             {flag ? state : icon}
//             {children}
//         </div>
//     );
// }

// function IconStateWithHover(
//     { icon, hover, isHovered, flag, className, children }:
//         { icon: React.ReactNode, hover: React.ReactNode, isHovered: boolean, flag: boolean, className?: string, children?: React.ReactNode }) {

//     const defaultIcon = flag ? icon : hover;
//     const hoverIcon = flag ? hover : icon;

//     const cn = twMerge(`flex flex-row items-center`, className);

//     return (
//         <div className={cn}>
//             {isHovered ? hoverIcon : defaultIcon}
//             {children}
//         </div>
//     );
// }

// export function SoulHolder({ children, soul }: { children: React.ReactNode, soul: SoulProperties }) {

// }

// export function SoulEditor({ children, souls = [], editor }: { children: React.ReactNode, souls?: SoulProperties[], editor?: SoulEditorProps }) {

//     const [isMinimized, setMinimized,] = useLocalStorage('opensouls_minimized', false, { initializeWithValue: false })

//     const [hoverRef, isHovered] = useHover();
//     const [hoverBarRef, isBarHovered] = useHover();
//     const [hoverSouls, isSoulHovered] = useHover();
//     const [hoverMinimize, isHoverMinimized] = useHover();

//     const [selectedSoul, setSelectedSoul] = useState<SoulProperties>(souls.length > 0 ? souls[0] : {} as SoulProperties);

//     const debugMode = process.env.NEXT_PUBLIC_SOUL_ENGINE_DASHBOARD === 'true';
//     const hasApiKey = process.env.NEXT_PUBLIC_SOUL_ENGINE_APIKEY !== undefined;

//     if (!debugMode) {
//         return (
//             <SoulProvider souls={souls}>
//                 {children}
//             </SoulProvider>
//         )
//     }

//     return (

//         <SoulProvider souls={souls}>
//             {children}

//             <div className={`fixed duration-200 w-screen bottom-0 flex flex-col items-center pointer-events-none`}>

//                 <div
//                     className={`absolute flex flex-col duration-100 ${isMinimized ? 'bottom-4 opacity-0' : 'bottom-16'} w-96 gap-2 pointer-events-auto `}
//                     ref={hoverRef}>


//                     <div className={`flex flex-col gap-1 items-end pt-4 ${(isHovered) ? 'block' : 'hidden'}`}>
//                         {souls.map((soul) => (
//                             soul?.soul?.soulId ? <SoulMapped key={soul.soul.soulId} soul={soul} /> : null
//                         ))}
//                     </div>

//                     <BG
//                         className={`flex flex-row items-center whitespace-nowrap py-1 px-2 w-full ${isMinimized ? '' : ''} justify-between ${isBarHovered ? 'border-gray-700' : ''}`}
//                         ref={hoverBarRef}
//                     >
//                         <button
//                             className={`flex flex-row align-middle`}
//                             onClick={() => setMinimized(!isMinimized)}
//                         >
//                             <img className="w-32 ml-2" src="logo_horizontal.svg" />
//                         </button>

//                         <div className={`flex flex-row items-center gap-1`}>

//                             <Button
//                                 className="p-2"
//                                 onClick={() => open('https://docs.souls.chat/', '_blank')}
//                             >
//                                 <ReaderIcon />
//                             </Button>

//                             <Button
//                                 className="p-2"
//                                 onClick={() => open('https://discord.com/invite/opensouls', '_blank')}
//                             >
//                                 <DiscordLogoIcon />
//                             </Button>

//                             <Button
//                                 className="p-2"
//                                 ref={hoverMinimize}
//                                 onClick={() => setMinimized(!isMinimized)}
//                             >
//                                 <IconState
//                                     icon={<Cross1Icon />}
//                                     state={<Cross1Icon />}
//                                     flag={isMinimized}
//                                 />

//                             </Button>

//                         </div>
//                     </BG>
//                 </div>


//                 <button
//                     className={`fixed flex flex-col inset-x-0 duration-200 bottom-4 p-2 pointer-events-auto ease-out ${isMinimized ? 'translate-y-0 opacity-50' : 'translate-y-12 opacity-0'}`}
//                     onClick={() => setMinimized(!isMinimized)}
//                 >
//                     <ArrowUpIcon className="mx-auto" />
//                 </button>
//             </div>

//         </SoulProvider >

//     );
// }

// function SoulMapped({ soul }: { soul: SoulProperties }) {

//     const [hoverRef, isHovered] = useHover();
//     const [age, setAge] = useState<string>('');

//     const URICallback = useCallback(() => {
//         console.log('open');
//         window.open(soul.URI, '_blank');
//     }, [soul.URI]);

//     useEffect(() => {
//         const now = new Date();
//         const pastDate = new Date(now.getFullYear(), now.getMonth() - 1, Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
//         setAge(ageString(pastDate, now));
//     }, [])

//     // console.log(soul.character.name, soul.soul.connected)

//     return (
//         <BG
//             className={`w-full flex flex-row gap-4 justify-between px-3 py-1 ${isHovered ? 'opacity-100' : 'opacity-75'}`}
//             ref={hoverRef}
//         >

//             <div className="flex flex-row gap-2 items-center">
//                 {soul?.soul?.connected ? (
//                     <CheckCircledIcon className="text-green-500" />
//                 ) : (
//                     <QuestionMarkCircledIcon className="text-orange-500 animate-spin" />
//                 )}
//                 <p className="select-none text-left whitespace-nowrap">{soul.character.name}</p>
//                 <p className="select-none text-left whitespace-nowrap text-xs text-gray-500">{age}</p>
//             </div>

//             <div className={`flex flex-row gap-2 items-center ${isHovered ? 'flex' : 'hidden'}`}>
//                 {soul?.settings?.code && <button
//                     className={`p-1 hover:opacity-100 opacity-75`}
//                     onClick={() => open(soul.settings.code, '_blank')}
//                 >
//                     <CodeIcon />
//                 </button>}

//                 {/* TODO editable README?? */}
//                 {/* <button
//                     className={`p-1 hover:opacity-100 opacity-75`}
//                     onClick={() => URICallback()}
//                 >
//                     <Pencil1Icon />
//                 </button> */}
//                 {soul.soulProps.debug === true &&
//                     <button
//                         className={`p-1 hover:opacity-100 opacity-75`}
//                         onClick={() => URICallback()}
//                     >
//                         <EyeOpenIcon />
//                     </button>}
//             </div>

//         </BG>
//     )
// }

// //create a react provider for the souls
// const SoulContext = createContext<SoulProperties[]>([]);

// export function SoulProvider({ children, souls }: { children: React.ReactNode, souls: SoulProperties[] }) {

//     return (
//         <SoulContext.Provider value={souls}>
//             {children}
//         </SoulContext.Provider>
//     );
// }

// function ageString(fromDate: Date, toDate: Date): string {
//     const diff = toDate.getTime() - fromDate.getTime();
//     const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
//     if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;

//     const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
//     if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;

//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//     return `${days} day${days > 1 ? 's' : ''}` || "0 days";
// }

// export default useSoul;

// "tailwind-merge": "^2.3.0",
// "@uidotdev/usehooks": "^2.4.1",
// "uuid": "^9.0.1",
// "@types/uuid": "^9.0.8",
// "usehooks-ts": "^3.1.0",
// "zustand": "^4.5.2"