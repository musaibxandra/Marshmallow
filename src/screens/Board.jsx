import Navbar from "../components/Navbar";
import BoardContainer from "../components/BoardContainer";
import { LinkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const Board = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col bg-gray-900 h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden p-2 sm:p-4 gap-2 sm:gap-4">
        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed left-5 bottom-8 z-50 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-600 transition-colors duration-150"
        >
          {sidebarOpen ? (
            <ChevronLeftIcon className="h-5 w-5" />
          ) : (
            <ChevronRightIcon className="h-5 w-5" />
          )}
        </button>

        {/* Left Sidebar - Inbox */}
        <div
          className={`
          bg-slate-800 border border-slate-600 flex flex-col rounded-lg shadow-lg
          transition-all duration-300 ease-in-out
          ${
            sidebarOpen
              ? "fixed inset-y-0 left-0 top-16 z-40 w-80 lg:relative lg:top-0 lg:w-72"
              : "hidden lg:flex lg:w-72"
          }
        `}
        >
          {/* Inbox Header */}
          <div className="p-4 sm:p-6 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                Inbox
              </h1>
              {/* Mobile close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-slate-200"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Inbox Content */}
          <div className="px-3 sm:px-4 py-4 sm:py-6 flex-1">
            <button
              className="w-full flex items-center px-3 sm:px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-600 hover:text-white rounded transition-colors duration-150 ease-in-out border border-slate-600 cursor-pointer"
              type="button"
            >
              <LinkIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-slate-400 mr-2 flex-shrink-0" />
              <span className="truncate">Connect with Slack</span>
            </button>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Right Side - Board Container */}
        <div className="flex-1 bg-gray-900 overflow-hidden rounded-lg shadow-lg border border-slate-600 min-w-0">
          <BoardContainer />
        </div>
      </div>
    </div>
  );
};

export default Board;
