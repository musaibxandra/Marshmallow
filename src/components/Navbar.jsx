import LogoImage from "../assets/logo.svg";
import { auth } from "../config/firebase";
import { Link, useNavigate } from "react-router-dom";
import {
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user data when currentUser changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Focus search input when mobile search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle mobile search toggle
  const toggleMobileSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchValue("");
    }
  };

  // Show loading state while auth is loading
  if (loading) {
    return (
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg border-b border-gray-700">
        <nav className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-24 sm:w-32"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg border-b border-gray-700">
      <nav className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left Section - Logo */}
          <div className="flex items-center flex-shrink-0">
            {currentUser && (
              <Link
                to={`/Home/${currentUser.uid}`}
                className="flex items-center space-x-2 sm:space-x-3 group"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-200">
                  <img
                    src={LogoImage}
                    alt="Marshmallow logo"
                    className="w-5 h-5 sm:w-6 sm:h-6 filter brightness-0 invert"
                  />
                </div>
                <span className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-100 transition-colors duration-200 hidden xs:block">
                  M
                </span>
                <span className="text-lg font-bold text-white group-hover:text-blue-100 transition-colors duration-200 xs:hidden">
                  Marshmallow
                </span>
              </Link>
            )}
          </div>

          {/* Center Section - Desktop Search & Create */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-xl mx-4">
            {/* Desktop Search Bar */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search boards, cards, and more..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:bg-gray-600/50 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
              />
            </div>

            {/* Desktop Create Button */}
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg border border-blue-500 hover:border-blue-400 transition-all duration-200 whitespace-nowrap">
              Create
            </button>
          </div>

          {/* Right Section - Mobile/Desktop Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Search Button */}
            <button
              onClick={toggleMobileSearch}
              className="md:hidden p-2 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Mobile Create Button */}
            <button className="md:hidden p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <PlusIcon className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors relative"
              >
                <BellIcon className="h-5 w-5" />
                {/* Notification badge */}
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
              </button>

              {/* Notifications Dropdown */}
              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-600 z-20 max-w-[90vw]">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <h3 className="text-sm font-medium text-gray-300">
                        Notifications
                      </h3>
                    </div>

                    <div className="py-2 max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-700 text-sm text-gray-300 cursor-pointer transition-colors">
                        <div className="font-medium">New message received</div>
                        <div className="text-xs text-gray-400 mt-1">
                          2 minutes ago
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-700 text-sm text-gray-300 cursor-pointer transition-colors">
                        <div className="font-medium">
                          System update available
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          1 hour ago
                        </div>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-700 text-sm text-gray-300 cursor-pointer transition-colors">
                        <div className="font-medium">
                          Welcome to Marshmallow!
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          1 day ago
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-2 border-t border-gray-700">
                      <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Avatar */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer"
                >
                  <span className="text-white font-semibold text-sm">
                    {userData?.firstName?.charAt(0).toUpperCase() ||
                      currentUser.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    />

                    <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-gray-800 rounded-xl shadow-2xl border border-gray-600 z-20 max-w-[90vw] overflow-hidden">
                      {/* Profile Header */}
                      <div className="px-4 py-4 bg-gradient-to-r from-gray-700 to-gray-800 border-b border-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg sm:text-xl">
                              {userData?.firstName?.charAt(0).toUpperCase() ||
                                currentUser.email?.charAt(0).toUpperCase() ||
                                "U"}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-300 truncate">
                              {userData
                                ? `${userData.firstName} ${userData.lastName}`
                                : "Loading..."}
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Options */}
                      <div className="py-2">
                        <button className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center space-x-3">
                          <svg
                            className="w-5 h-5 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="text-gray-300 text-sm">
                            Profile Settings
                          </span>
                        </button>

                        <button className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center space-x-3">
                          <svg
                            className="w-5 h-5 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                          <span className="text-gray-300 text-sm">
                            My Boards
                          </span>
                        </button>

                        <button className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center space-x-3">
                          <svg
                            className="w-5 h-5 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-gray-300 text-sm">
                            Account Settings
                          </span>
                        </button>

                        <button className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center space-x-3">
                          <svg
                            className="w-5 h-5 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-gray-300 text-sm">
                            Help & Support
                          </span>
                        </button>

                        <div className="border-t border-gray-700 my-2"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-left hover:bg-red-900/20 transition-colors flex items-center space-x-3 group"
                        >
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-red-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span className="text-gray-300 group-hover:text-red-400 font-medium text-sm">
                            Logout
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden border-t border-gray-700 p-4 bg-gray-800/50 backdrop-blur-sm">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search boards, cards, and more..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    toggleMobileSearch();
                  }
                }}
              />
              <button
                onClick={toggleMobileSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
