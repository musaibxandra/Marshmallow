Users: {
UserId: {
firstName: "Mohammed",
lastName: "Maqdoom",
email: "mus@gmail.com",
boards: {
boardId1: {
name: "Project X",
createdAt: new Date();
lists: { // Subcollection
listId1: {
name: "To Do", // Only list name
tasks: { // Subcollection
taskId1: {
description: "Build UI"
}
}
}
}
}
}
}
}
