import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef } from "react";
import { db } from "../config/firebase";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { EllipsisHorizontalIcon, TrashIcon } from "@heroicons/react/24/solid";
import {
  PlusIcon,
  SwatchIcon,
  XMarkIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import AddList from "./AddList";

const ListCard = () => {
  const { boardId } = useParams();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardTitle, setCardTitle] = useState("");
  const [openCardInputId, setOpenCardInputId] = useState(null);
  const [cards, setCards] = useState({}); // Store cards for each list
  const [currentUser, setCurrentUser] = useState(null);
  const [openPopoverId, setOpenPopoverId] = useState(null); // For managing popover state
  const [editingCardId, setEditingCardId] = useState(null); // For managing card editing state
  const [editCardTitle, setEditCardTitle] = useState(""); // For storing the edited card title
  const [editingListId, setEditingListId] = useState(null); // For managing list editing state
  const [editListTitle, setEditListTitle] = useState(""); // For storing the edited list title
  const [openCardPopoverId, setOpenCardPopoverId] = useState(null); // For managing card popover state
  const popoverRef = useRef(null);

  // Drag and drop state
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedList, setDraggedList] = useState(null);
  const [, setDragOverListId] = useState(null);
  const [, setDragOverPosition] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && boardId) {
        const listsRef = collection(
          db,
          "Users",
          user.uid,
          "boards",
          boardId,
          "lists",
        );

        const unsubscribeLists = onSnapshot(listsRef, (snapshot) => {
          const listsData = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order field
          setLists(listsData);
          setLoading(false);

          // Set up listeners for cards in each list
          listsData.forEach((list) => {
            const cardsRef = collection(
              db,
              "Users",
              user.uid,
              "boards",
              boardId,
              "lists",
              list.id,
              "cards",
            );
            onSnapshot(cardsRef, (cardsSnapshot) => {
              const cardsData = cardsSnapshot.docs
                .map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }))
                .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order field
              setCards((prev) => ({
                ...prev,
                [list.id]: cardsData,
              }));
            });
          });
        });

        return () => unsubscribeLists();
      }
    });

    return () => unsubscribe();
  }, [boardId]);

  // Handle clicking outside popover to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpenPopoverId(null);
        setOpenCardPopoverId(null);
      }
    };

    if (openPopoverId || openCardPopoverId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openPopoverId, openCardPopoverId]);

  const handleListAdded = (newList) => {
    // This will be handled automatically by the onSnapshot listener
    // No need to manually update the lists state
    console.log("New list will be added by Firestore listener:", newList.id);
  };

  const addCard = async (listId) => {
    if (!currentUser) {
      console.error("No user signed in.");
      return;
    }
    if (!boardId) {
      console.error("No board reference available.");
      return;
    }
    if (!cardTitle.trim()) {
      console.error("Card title cannot be empty.");
      return;
    }

    try {
      // Get the current number of cards to set the order
      const listCards = cards[listId] || [];
      const order = listCards.length;

      const cardRef = await addDoc(
        collection(
          db,
          "Users",
          currentUser.uid,
          "boards",
          boardId,
          "lists",
          listId,
          "cards",
        ),
        {
          title: cardTitle.trim(),
          createdAt: new Date(),
          order: order,
        },
      );

      console.log("Card added with ID:", cardRef.id);

      // Reset form
      setCardTitle("");
      setOpenCardInputId(null);
    } catch (error) {
      console.error("Error Adding Card:", error);
    }
  };

  // Card drag handlers
  const handleCardDragStart = (e, card, listId) => {
    setDraggedCard({ ...card, sourceListId: listId });
    e.dataTransfer.effectAllowed = "move";
    // Remove opacity change during drag
  };

  const handleCardDragEnd = () => {
    // Remove opacity reset since we're not changing it
    setDraggedCard(null);
    setDragOverListId(null);
    setDragOverPosition(null);
  };

  const handleCardDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleCardDrop = async (e, targetListId, targetPosition = null) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedCard || !currentUser) return;

    const sourceListId = draggedCard.sourceListId;
    const cardId = draggedCard.id;

    try {
      // If moving within the same list, reorder cards
      if (sourceListId === targetListId) {
        const listCards = [...(cards[targetListId] || [])];
        const cardIndex = listCards.findIndex((c) => c.id === cardId);
        const [movedCard] = listCards.splice(cardIndex, 1);

        const insertIndex =
          targetPosition !== null ? targetPosition : listCards.length;
        listCards.splice(insertIndex, 0, movedCard);

        // Update order for all cards in the list
        const updatePromises = listCards.map((card, index) =>
          updateDoc(
            doc(
              db,
              "Users",
              currentUser.uid,
              "boards",
              boardId,
              "lists",
              targetListId,
              "cards",
              card.id,
            ),
            {
              order: index,
            },
          ),
        );

        await Promise.all(updatePromises);
      } else {
        // Moving between lists
        // Remove from source list and update orders
        const sourceCards = [...(cards[sourceListId] || [])];
        const cardIndex = sourceCards.findIndex((c) => c.id === cardId);
        const [movedCard] = sourceCards.splice(cardIndex, 1);

        // Update orders in source list
        const sourceUpdatePromises = sourceCards.map((card, index) =>
          updateDoc(
            doc(
              db,
              "Users",
              currentUser.uid,
              "boards",
              boardId,
              "lists",
              sourceListId,
              "cards",
              card.id,
            ),
            {
              order: index,
            },
          ),
        );

        // Add to target list
        const targetCards = [...(cards[targetListId] || [])];
        const insertIndex =
          targetPosition !== null ? targetPosition : targetCards.length;

        // Create new card document in target list
        await addDoc(
          collection(
            db,
            "Users",
            currentUser.uid,
            "boards",
            boardId,
            "lists",
            targetListId,
            "cards",
          ),
          {
            title: movedCard.title,
            createdAt: movedCard.createdAt,
            updatedAt: new Date(),
            order: insertIndex,
          },
        );

        // Update orders for cards after the inserted position in target list
        const targetUpdatePromises = targetCards
          .slice(insertIndex)
          .map((card, index) =>
            updateDoc(
              doc(
                db,
                "Users",
                currentUser.uid,
                "boards",
                boardId,
                "lists",
                targetListId,
                "cards",
                card.id,
              ),
              {
                order: insertIndex + index + 1,
              },
            ),
          );

        // Delete original card from source list
        await deleteDoc(
          doc(
            db,
            "Users",
            currentUser.uid,
            "boards",
            boardId,
            "lists",
            sourceListId,
            "cards",
            cardId,
          ),
        );

        await Promise.all([...sourceUpdatePromises, ...targetUpdatePromises]);
      }
    } catch (error) {
      console.error("Error moving card:", error);
    }

    setDragOverListId(null);
    setDragOverPosition(null);
  };

  const handleCardDragEnter = (e) => {
    e.preventDefault();
    // Remove setting drag over state
  };

  const handleCardDragLeave = () => {
    // Remove drag over state management
  };

  // List drag handlers
  const handleListDragStart = (e, list) => {
    setDraggedList(list);
    e.dataTransfer.effectAllowed = "move";
    // Remove opacity change during drag
  };

  const handleListDragEnd = () => {
    // Remove opacity reset since we're not changing it
    setDraggedList(null);
  };

  const handleListDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleListDrop = async (e, targetListId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedList || !currentUser || draggedList.id === targetListId) return;

    try {
      const reorderedLists = [...lists];
      const sourceIndex = reorderedLists.findIndex(
        (l) => l.id === draggedList.id,
      );
      const targetIndex = reorderedLists.findIndex(
        (l) => l.id === targetListId,
      );

      const [movedList] = reorderedLists.splice(sourceIndex, 1);
      reorderedLists.splice(targetIndex, 0, movedList);

      // Update order for all lists
      const updatePromises = reorderedLists.map((list, index) =>
        updateDoc(
          doc(
            db,
            "Users",
            currentUser.uid,
            "boards",
            boardId,
            "lists",
            list.id,
          ),
          {
            order: index,
          },
        ),
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error reordering lists:", error);
    }
  };

  const handleAddCardClick = (listId) => {
    setOpenCardInputId(listId);
    setCardTitle(""); // Reset card title when opening input
  };

  const handleCloseCardInput = () => {
    setOpenCardInputId(null);
    setCardTitle(""); // Reset card title when closing
  };

  const handleKeyDown = (e, listId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addCard(listId);
    }
  };

  const handlePopoverToggle = (listId) => {
    setOpenPopoverId(openPopoverId === listId ? null : listId);
    setOpenCardPopoverId(null); // Close any open card popovers
  };

  const handleCardPopoverToggle = (cardId) => {
    setOpenCardPopoverId(openCardPopoverId === cardId ? null : cardId);
    setOpenPopoverId(null); // Close any open list popovers
  };

  const handleEditCard = (card) => {
    setEditingCardId(card.id);
    setEditCardTitle(card.title);
    setOpenCardPopoverId(null); // Close the popover
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditCardTitle("");
  };

  const handleEditList = (list) => {
    setEditingListId(list.id);
    setEditListTitle(list.title);
    setOpenPopoverId(null); // Close the popover
  };

  const handleCancelListEdit = () => {
    setEditingListId(null);
    setEditListTitle("");
  };

  const handleDeleteList = async (listId) => {
    if (!currentUser) {
      console.error("No user signed in.");
      return;
    }
    if (!boardId) {
      console.error("No board reference available.");
      return;
    }

    try {
      // Delete the list document
      await deleteDoc(
        doc(db, "Users", currentUser.uid, "boards", boardId, "lists", listId),
      );

      console.log("List deleted successfully");
      setOpenPopoverId(null); // Close the popover
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const handleUpdateList = async (listId) => {
    if (!currentUser) {
      console.error("No user signed in.");
      return;
    }
    if (!boardId) {
      console.error("No board reference available.");
      return;
    }
    if (!editListTitle.trim()) {
      console.error("List title cannot be empty.");
      return;
    }

    try {
      // Update the list document
      await updateDoc(
        doc(db, "Users", currentUser.uid, "boards", boardId, "lists", listId),
        {
          title: editListTitle.trim(),
          updatedAt: new Date(),
        },
      );

      console.log("List updated successfully");
      setEditingListId(null);
      setEditListTitle("");
    } catch (error) {
      console.error("Error updating list:", error);
    }
  };

  const handleDeleteCard = async (listId, cardId) => {
    if (!currentUser) {
      console.error("No user signed in.");
      return;
    }
    if (!boardId) {
      console.error("No board reference available.");
      return;
    }

    try {
      // Delete the card document
      await deleteDoc(
        doc(
          db,
          "Users",
          currentUser.uid,
          "boards",
          boardId,
          "lists",
          listId,
          "cards",
          cardId,
        ),
      );

      console.log("Card deleted successfully");
      setOpenCardPopoverId(null); // Close the popover
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  const handleUpdateCard = async (listId, cardId) => {
    if (!currentUser) {
      console.error("No user signed in.");
      return;
    }
    if (!boardId) {
      console.error("No board reference available.");
      return;
    }
    if (!editCardTitle.trim()) {
      console.error("Card title cannot be empty.");
      return;
    }

    try {
      // Update the card document
      await updateDoc(
        doc(
          db,
          "Users",
          currentUser.uid,
          "boards",
          boardId,
          "lists",
          listId,
          "cards",
          cardId,
        ),
        {
          title: editCardTitle.trim(),
          updatedAt: new Date(),
        },
      );

      console.log("Card updated successfully");
      setEditingCardId(null);
      setEditCardTitle("");
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  const handleEditKeyDown = (e, listId, cardId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUpdateCard(listId, cardId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleListEditKeyDown = (e, listId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUpdateList(listId);
    } else if (e.key === "Escape") {
      handleCancelListEdit();
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <>
      {lists.map((list) => (
        <div
          key={list.id}
          className="bg-gray-700 m-2 sm:m-3 p-2 w-full sm:w-80 md:w-72 lg:w-80 xl:w-1/4 flex-shrink-0 rounded-lg relative min-w-64"
          draggable={!editingListId}
          onDragStart={(e) => handleListDragStart(e, list)}
          onDragEnd={handleListDragEnd}
          onDragOver={handleListDragOver}
          onDrop={(e) => handleListDrop(e, list.id)}
          onDragEnter={(e) => handleCardDragEnter(e, list.id)}
          onDragLeave={handleCardDragLeave}
        >
          <div className="flex items-center justify-between w-full rounded">
            {editingListId === list.id ? (
              // List edit mode
              <div className="flex-1 mr-2">
                <input
                  type="text"
                  value={editListTitle}
                  onChange={(e) => setEditListTitle(e.target.value)}
                  onKeyDown={(e) => handleListEditKeyDown(e, list.id)}
                  className="w-full text-white placeholder-gray-400 focus:outline-none border-none p-2 bg-gray-600 rounded text-sm font-bold"
                  autoFocus
                />
                <div className="flex items-center justify-start gap-x-2 mt-2">
                  <button
                    onClick={() => handleUpdateList(list.id)}
                    className="text-white px-3 py-1 text-xs rounded hover:bg-green-500 bg-green-600 cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelListEdit}
                    className="hover:bg-gray-500 hover:text-white px-2 py-1 rounded text-gray-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // List view mode
              <>
                <span className="font-bold text-sm text-gray-300 p-2 cursor-grab active:cursor-grabbing truncate flex-1 min-w-0">
                  {list.title}
                </span>
                <div className="relative">
                  <button
                    onClick={() => handlePopoverToggle(list.id)}
                    className="hover:bg-gray-500 cursor-pointer rounded-lg"
                  >
                    <EllipsisHorizontalIcon className="w-6 h-6 text-gray-200" />
                  </button>

                  {/* Popover */}
                  {openPopoverId === list.id && (
                    <div
                      ref={popoverRef}
                      className="absolute top-8 right-0 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-lg min-w-[240px]"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => handleEditList(list)}
                          className="w-full px-4 py-2 text-left text-blue-400 hover:bg-gray-700 hover:text-blue-300 flex items-center gap-2 text-sm"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                          Rename
                        </button>
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center gap-2 text-sm"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Delete List
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Display existing cards */}
          <div
            className="min-h-[20px]"
            onDrop={(e) => handleCardDrop(e, list.id)}
            onDragOver={handleCardDragOver}
          >
            {cards[list.id] &&
              cards[list.id].map((card) => (
                <div
                  key={card.id}
                  className="bg-gray-600 m-2 p-1.5 rounded-md group cursor-grab active:cursor-grabbing"
                  draggable={!editingCardId}
                  onDragStart={(e) => handleCardDragStart(e, card, list.id)}
                  onDragEnd={handleCardDragEnd}
                >
                  {editingCardId === card.id ? (
                    // Edit mode
                    <div className="w-full">
                      <textarea
                        value={editCardTitle}
                        onChange={(e) => setEditCardTitle(e.target.value)}
                        onKeyDown={(e) =>
                          handleEditKeyDown(e, list.id, card.id)
                        }
                        className="resize-none w-full text-white placeholder-gray-400 focus:outline-none border-none p-1 bg-gray-500 rounded text-sm"
                        autoFocus
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                      />
                      <div className="flex items-center justify-start gap-x-2 mt-2">
                        <button
                          onClick={() => handleUpdateCard(list.id, card.id)}
                          className="text-white px-3 py-1 text-xs rounded hover:bg-green-500 bg-green-600 cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="hover:bg-gray-500 hover:text-white px-2 py-1 rounded text-gray-300 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex pl-1.5 items-center justify-between">
                      <span className="text-white text-sm flex-1 pr-2 pointer-events-none">
                        {card.title}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardPopoverToggle(card.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:bg-gray-500 cursor-pointer rounded transition-opacity duration-200"
                        >
                          <EllipsisHorizontalIcon className="w-5 h-5 text-white" />
                        </button>

                        {/* Card Popover */}
                        {openCardPopoverId === card.id && (
                          <div
                            ref={popoverRef}
                            className="absolute top-8 right-0 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-lg min-w-[120px]"
                          >
                            <div className="py-1">
                              <button
                                onClick={() => handleEditCard(card)}
                                className="w-full px-4 py-2 text-left text-blue-400 hover:bg-gray-700 hover:text-blue-300 flex items-center gap-2 text-sm"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCard(list.id, card.id)
                                }
                                className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center gap-2 text-sm"
                              >
                                <TrashIcon className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {openCardInputId === list.id ? (
            <div className="w-full flex flex-col items-center p-1">
              <div className="w-full flex items-center justify-between rounded-md border-2 border-gray-400 hover:border-transparent">
                <textarea
                  className="resize-none w-full justify-start text-white placeholder-gray-400 focus:outline-none border-none p-2 h-14 rounded bg-gray-600"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, list.id)}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  placeholder="Enter a title or paste a link"
                  autoFocus
                />
              </div>
              <div className="w-full flex items-center justify-start gap-x-2 mt-2">
                <button
                  onClick={() => addCard(list.id)}
                  className="text-black pl-4 pr-4 pt-2 pb-2 text-sm rounded hover:bg-green-500 bg-green-600 cursor-pointer"
                >
                  Add card
                </button>
                <button
                  onClick={handleCloseCardInput}
                  className="hover:bg-gray-500 hover:text-white p-2 rounded text-gray-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center w-full justify-between p-1">
              <button
                onClick={() => handleAddCardClick(list.id)}
                className="w-full flex items-center justify-start cursor-pointer text-sm hover:bg-gray-500 hover:text-white hover:text-md rounded-md text-gray-300 p-1"
              >
                <PlusIcon className="w-4.5 h-4.5" />
                &nbsp;&nbsp;Add a card
              </button>
              <button className="flex items-center justify-center cursor-pointer hover:bg-gray-500 hover:text-white rounded-md p-1.5">
                <SwatchIcon className="size-4.5 text-gray-200" />
              </button>
            </div>
          )}
        </div>
      ))}
      <AddList onListAdded={handleListAdded} />
    </>
  );
};

export default ListCard;
