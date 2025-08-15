import ListCard from "./ListCard";
import { useState } from "react";
import { useEffect } from "react";
import { db } from "../config/firebase";
import { auth } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import {
  UserIcon,
  UsersIcon,
  ShareIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

const BoardContainer = () => {
  const { boardId } = useParams();
  const [boardTitle, setBoardTitle] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchBoardData = async () => {
      if (!user || !boardId) return;
      try {
        const boardRef = doc(db, "Users", user.uid, "boards", boardId);
        const boardSnap = await getDoc(boardRef);
        if (boardSnap.exists()) {
          const boardData = boardSnap.data();
          setBoardTitle(boardData.title);
        } else {
          console.log("Board not found");
        }
      } catch (error) {
        console.error("Error fetching board:", error);
      }
    };
    fetchBoardData();
  }, [boardId, user]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Board Header */}
      <div className="bg-gray-900 border-b border-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Board Title */}
          <h1 className="text-lg sm:text-xl font-semibold text-white truncate pr-4 flex-1 min-w-0">
            {boardTitle || "Board Title"}
          </h1>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-2">
            <button className="flex items-center px-2 md:px-3 py-2 text-xs md:text-sm font-medium text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-colors duration-150 ease-in-out cursor-pointer">
              <UserIcon className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Profile</span>
            </button>
            <button className="flex items-center px-2 md:px-3 py-2 text-xs md:text-sm font-medium text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-colors duration-150 ease-in-out cursor-pointer">
              <UsersIcon className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Members</span>
            </button>
            <button className="flex items-center px-2 md:px-3 py-2 text-xs md:text-sm font-medium text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-colors duration-150 ease-in-out cursor-pointer">
              <ShareIcon className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Share</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex items-center justify-center p-2 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-colors duration-150 ease-in-out"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>

            {/* Mobile Dropdown Menu */}
            {showMobileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-50">
                <div className="py-2">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <UserIcon className="h-4 w-4 mr-3" />
                    Profile
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <UsersIcon className="h-4 w-4 mr-3" />
                    Members
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <ShareIcon className="h-4 w-4 mr-3" />
                    Share
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lists Container */}
      <div className="flex-1 flex items-start overflow-x-auto flex-shrink-0 p-3 sm:p-4 md:p-6 space-x-3 sm:space-x-4 md:space-x-6 custom-scrollbar mb-3">
        <ListCard />
      </div>

      {/* Click outside to close mobile menu */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  );
};

export default BoardContainer;
