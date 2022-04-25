using Microsoft.AspNetCore.SignalR;

namespace ChatAppSignalR.Hubs
{
    public class ChatHub : Hub
    {
        private static Dictionary<string, byte> groupNames = new();
        public static Dictionary<string, byte> GroupNames { get => groupNames; set => groupNames = value; }

        public async Task JoinRoom(string roomName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            if(!GroupNames.ContainsKey(roomName)) GroupNames.Add(roomName, 0);
            GroupNames[roomName]++;
            await Clients.Group(roomName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} joined the room.");
        }
        public async Task LeaveRoom(string roomName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
            GroupNames[roomName]--;
            if (GroupNames[roomName] == 0) GroupNames.Remove(roomName);
            await Clients.Group(roomName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} left the room.");
        }

        public async Task SendToAllUsers(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }

        public async Task SendToGroup(string message, string username, string groupName)
        {
            await Clients.Group(groupName).SendAsync("ReceiveMessage", message, username);
        }

        public string FindRoom()
        {
            if (!GroupNames.ContainsValue(1)) return "roomNull";

            foreach(var room in GroupNames)
            {
                if (room.Value == 1) return room.Key;
            }

            return "roomNull";
        }

}
}