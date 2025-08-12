import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { auth, db } from "../config/firebase";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";

const AddList = ({ onListAdded }) => {
  const [openCardList, setOpenCardList] = useState(false);
  const [listTitle, setListTitle] = useState("");
  const [, setListId] = useState("");
  const { boardId } = useParams();

  const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          resolve(user);
        },
        reject,
      );
    });
  };

  const addList = async (listTitle) => {
    const user = await getCurrentUser();
    if (!user) {
      console.error("No user signed in.");
      return;
    }
    if (!boardId) {
      console.error("No board reference available.");
      return;
    }
    if (!listTitle || listTitle.trim() === "") {
      console.error("List title cannot be empty");
      return; // This will exit the function without adding the list or closing the input
    }
    try {
      const listRef = await addDoc(
        collection(db, "Users", user.uid, "boards", boardId, "lists"),
        {
          title: listTitle,
        },
      );
      setListTitle("");
      setOpenCardList(false);
      setListId(listRef.id);
      console.log("List ID:", listRef.id);
      if (onListAdded) {
        onListAdded({
          id: listRef.id,
          title: listTitle,
        });
      }
    } catch (error) {
      console.error("Error Adding List:", error);
    }
  };

  return (
    <div className="m-2 sm:m-3 w-full sm:w-80 md:w-72 lg:w-80 xl:w-1/4 flex-shrink-0 min-w-64">
      {openCardList ? (
        <div className="bg-gray-700 rounded-md w-full flex flex-col items-center p-2 sm:p-3">
          <div className="w-full flex items-center justify-start rounded">
            <textarea
              value={listTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  addList(listTitle);
                }
              }}
              onChange={(e) => setListTitle(e.target.value)}
              placeholder="Enter list name..."
              className="w-full outline-none p-2 sm:p-3 placeholder-gray-400 placeholder:text-sm placeholder:font-bold border-gray-400 border-2 rounded resize-none text-white leading-tight overflow-hidden bg-gray-600 min-h-[40px] max-h-24"
              rows="1"
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`; // Max height of 96px (24 * 4)
              }}
            />
          </div>

          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-start mt-2 sm:mt-3 gap-2">
            <button
              onClick={() => addList(listTitle)}
              className="flex items-center justify-center text-black px-4 py-2 sm:py-1.5 text-sm font-medium rounded hover:bg-green-500 bg-green-600 cursor-pointer transition-colors duration-150 flex-1 sm:flex-none min-h-[36px]"
            >
              Add list
            </button>
            <button
              onClick={() => {
                setOpenCardList(false);
                setListTitle("");
              }}
              className="flex items-center justify-center hover:bg-gray-500 hover:text-white p-2 rounded text-gray-300 transition-colors duration-150 sm:ml-0 min-h-[36px] min-w-[36px]"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center justify-center cursor-pointer w-full backdrop-blur-md bg-white/20 border border-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 min-h-[48px] text-sm sm:text-base font-medium"
          onClick={() => setOpenCardList(true)}
        >
          <PlusIcon className="w-4 h-3 sm:w-6 sm:h-5 mr-2 flex-shrink-0" />
          <span className="truncate">Add a List</span>
        </button>
      )}
    </div>
  );
};

export default AddList;
