// import React from "react";
// import { useTranslation } from "react-i18next";

// interface CreateChatProps {
//   type: "group" | "channel";
// }

// const CreateNewGroupChat: React.FC<CreateChatProps> = ({ type }) => {
//   const { t } = useTranslation();

//   return (
//     <div className="flex flex-col h-full">
//       <div className="p-2">
//         <p className="text-gray-400 text-center">
//           Testing mode: no search, no contacts selected
//         </p>
//       </div>

//       <div className="flex-1 flex items-center justify-center opacity-40">
//         <i className="material-symbols-outlined text-6xl">search_off</i>
//         <p>
//           {type === "group"
//             ? t("common.messages.no_contacts")
//             : t("common.messages.no_channels")}
//         </p>
//       </div>

//       <form className="flex flex-col p-3 gap-2 custom-border-t">
//         <input
//           type="text"
//           placeholder={t("sidebar_new_chat.group.enter_name")}
//           className="w-full p-1 text-lg"
//           disabled
//         />
//         <button className="flex items-center justify-center gap-2 py-1 w-full bg-gray-300 cursor-not-allowed">
//           {t(
//             type === "group"
//               ? "sidebar_new_chat.group.create_group"
//               : "sidebar_new_chat.group.create_channel"
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateNewGroupChat;
