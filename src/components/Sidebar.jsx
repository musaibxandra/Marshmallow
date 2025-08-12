import {
  ClipboardDocumentCheckIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  NewspaperIcon,
  HomeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const Sidebar = () => {
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(true);

  const mainNavItems = [
    { icon: HomeIcon, label: "Home", active: false },
    { icon: ClipboardDocumentCheckIcon, label: "Boards", active: true },
    { icon: NewspaperIcon, label: "Templates", active: false },
  ];

  const workspaceItems = [
    { icon: ClipboardDocumentCheckIcon, label: "My Boards", active: false },
    { icon: UserPlusIcon, label: "Members", active: false },
    { icon: Cog6ToothIcon, label: "Settings", active: false },
    { icon: BanknotesIcon, label: "Billing", active: false },
  ];

  return (
    <div className="bg-gray-900 border-r border-gray-700 w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-lg lg:text-xl font-semibold text-white truncate">
          Dashboard
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Main Navigation */}
        <div className="p-3 lg:px-4 lg:py-6">
          <nav className="space-y-1">
            {mainNavItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  type="button"
                  className={`w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out group ${
                    item.active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2 lg:mr-3 flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span className="truncate">{item.label}</span>
                  {item.active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-75"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Separator */}
        <div className="px-4 lg:px-6">
          <hr className="border-gray-700" />
        </div>

        {/* Workspaces Section */}
        <div className="p-3 lg:px-4 lg:py-6 flex-1">
          {/* Collapsible Header */}
          <button
            onClick={() => setIsWorkspaceExpanded(!isWorkspaceExpanded)}
            className="w-full flex items-center justify-between px-3 lg:px-4 py-2 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors rounded-md hover:bg-gray-800"
          >
            <span>Workspaces</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform duration-200 ${
                isWorkspaceExpanded ? "rotate-0" : "-rotate-90"
              }`}
            />
          </button>

          {/* Expandable Workspace Items */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isWorkspaceExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <nav className="space-y-1">
              {workspaceItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    type="button"
                    className="w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200 ease-in-out group"
                  >
                    <Icon className="h-5 w-5 mr-2 lg:mr-3 flex-shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Workspace Card - Mobile Optimized */}
        <div className="p-3 lg:p-4 mt-auto">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-3 lg:p-4 border border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm lg:text-base">
                  M
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-white truncate">
                  Marshmallow
                </h3>
                <p className="text-xs text-gray-400">Free Plan</p>
              </div>
            </div>

            {/* Quick Actions - Mobile Responsive */}
            <div className="mt-3 lg:mt-4 space-y-2">
              <button className="w-full text-xs lg:text-sm text-gray-300 hover:text-white text-left py-1 px-2 rounded hover:bg-gray-600 transition-colors">
                Upgrade Plan
              </button>
              <button className="w-full text-xs lg:text-sm text-gray-300 hover:text-white text-left py-1 px-2 rounded hover:bg-gray-600 transition-colors">
                Invite Members
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Always Visible */}
      <div className="p-3 lg:p-4 border-t border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Version 2.0</span>
          <button className="hover:text-gray-300 transition-colors">
            Help
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
