import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Popover } from "react-tiny-popover";
import {
  UsersIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Home = () => {
  const [isCreateButtonOpen, setIsCreateButtonOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [, setBoardId] = useState("");
  const [, setUser] = useState("");
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setListId] = useState("");
  const [activeTab, setActiveTab] = useState("boards");

  const navigate = useNavigate();

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const boardsRef = collection(db, "Users", currentUser.uid, "boards");
          const unsubscribeBoards = onSnapshot(boardsRef, (snapshot) => {
            const userBoards = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setBoards(userBoards);
            setLoading(false);
            console.log(userBoards);
          });

          return () => unsubscribeBoards();
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const openBoard = async (boardId) => {
    const user = await getCurrentUser();

    if (!user) {
      console.error("No user signed in.");
      return;
    }
    if (!boardId) {
      console.error("No boardId in URL.");
      return;
    }
    try {
      const docRef = doc(db, "Users", user.uid, "boards", boardId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log(docSnap.data());
        navigate(`/Board/${boardId}`);
      } else {
        console.log("No such board!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addBoard = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.error("No user signed in.");
      return;
    }

    if (!boardTitle.trim()) {
      console.error("Board title cannot be empty.");
      return;
    }

    try {
      const boardRef = await addDoc(
        collection(db, "Users", user.uid, "boards"),
        {
          title: boardTitle.trim(),
          createdAt: new Date(),
        },
      );

      const listRef = await addDoc(
        collection(db, "Users", user.uid, "boards", boardRef.id, "lists"),
        {
          title: "To Do",
          createdAt: new Date(),
        },
      );

      setListId(listRef.id);
      setBoardId(boardRef.id);

      setBoardTitle("");
      setIsCreateButtonOpen(false);

      console.log("Board ID:", boardRef.id);
      navigate(`/Board/${boardRef.id}`);
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  const tabs = [
    { id: "boards", label: "Boards", icon: ClipboardDocumentListIcon },
    { id: "members", label: "Members", icon: UsersIcon },
    { id: "settings", label: "Settings", icon: Cog6ToothIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex">
          {/* Loading Sidebar Space - Desktop Only */}
          <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
            <div className="w-full bg-gray-900"></div>
          </div>

          {/* Loading Content */}
          <div className="flex-1 flex items-center justify-center bg-gray-800 min-h-0">
            <div className="text-center p-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading your workspace...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:hidden
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <span className="text-white font-semibold">Menu</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <Sidebar />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
          <div className="w-full bg-gray-900">
            <Sidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-800">
          {/* Header Section */}
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Your Workspace
              </h1>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-300 text-sm md:text-base">
              Manage your projects and collaborate with your team
            </p>
          </div>

          {/* Workspace Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-4 flex-shrink-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-lg">M</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-xl font-semibold text-white truncate">
                    Marshmallow Workspace
                  </h2>
                  <p className="text-sm text-gray-400">Personal workspace</p>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-gray-700 p-1 rounded-lg overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-gray-300 hover:text-white hover:bg-gray-600"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.charAt(0)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-800">
            <div className="p-4 h-full">
              {activeTab === "boards" && (
                <div className="h-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      Recent Boards
                    </h3>
                    <div className="text-sm text-gray-400">
                      {boards.length} {boards.length === 1 ? "board" : "boards"}
                    </div>
                  </div>

                  {/* Responsive Boards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {/* Create Board Card */}
                    <div className="relative">
                      <Popover
                        isOpen={isCreateButtonOpen}
                        positions={["bottom", "right", "top", "left"]}
                        content={
                          <div className="p-6 w-80 max-w-[90vw] bg-gray-700 rounded-md shadow-xl border border-gray-600">
                            <h3 className="text-lg font-semibold text-gray-300 mb-4">
                              Create New Board
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <label
                                  htmlFor="boardTitle"
                                  className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                  Board Title
                                </label>
                                <input
                                  type="text"
                                  id="boardTitle"
                                  value={boardTitle}
                                  onChange={(e) =>
                                    setBoardTitle(e.target.value)
                                  }
                                  placeholder="Enter board title"
                                  className="w-full border border-gray-500 rounded-md bg-gray-800 text-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      boardTitle.trim()
                                    ) {
                                      addBoard();
                                    }
                                    if (e.key === "Escape") {
                                      setIsCreateButtonOpen(false);
                                      setBoardTitle("");
                                    }
                                  }}
                                />
                                {!boardTitle.trim() && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Board title is required
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  onClick={addBoard}
                                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    boardTitle.trim()
                                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                                      : "bg-gray-500 text-gray-400 cursor-not-allowed"
                                  }`}
                                  disabled={!boardTitle.trim()}
                                >
                                  Create Board
                                </button>
                                <button
                                  onClick={() => {
                                    setIsCreateButtonOpen(false);
                                    setBoardTitle("");
                                  }}
                                  className="px-4 py-2 text-sm text-gray-300 rounded-md border border-gray-500 hover:bg-gray-600 font-medium transition-colors duration-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        }
                      >
                        <button
                          onClick={() =>
                            setIsCreateButtonOpen(!isCreateButtonOpen)
                          }
                          className="w-64 h-32 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium border-2 border-dashed border-gray-600 hover:border-gray-500"
                        >
                          <span className="text-center px-4">
                            Create new board
                          </span>
                        </button>
                      </Popover>
                    </div>

                    {/* Board Cards */}
                    {boards.map((board) => (
                      <button
                        onClick={() => openBoard(board.id)}
                        key={board.id}
                        className="w-62 h-32 bg-gradient-to-br from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-md text-left relative cursor-pointer overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 group"
                      >
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200 rounded-lg" />

                        {/* Title strip at the bottom */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-sm pl-3 p-1.5">
                          <span className="text-gray-300 group-hover:text-white font-medium text-sm truncate block">
                            {board.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {boards.length === 0 && (
                    <div className="text-center py-12">
                      <ClipboardDocumentListIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">
                        No boards yet
                      </h3>
                      <p className="text-gray-400 mb-4 max-w-md mx-auto">
                        Create your first board to get started with organizing
                        your projects
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "members" && (
                <div className="text-center py-12 h-full flex flex-col items-center justify-center">
                  <UsersIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Workspace Members
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Invite team members to collaborate on your projects
                  </p>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="text-center py-12 h-full flex flex-col items-center justify-center">
                  <Cog6ToothIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Workspace Settings
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Manage your workspace preferences and configuration
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
