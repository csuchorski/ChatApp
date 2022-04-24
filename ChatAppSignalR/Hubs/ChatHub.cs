using Microsoft.AspNetCore.SignalR;

namespace ChatAppSignalR.Hubs
{
    public class ChatHub : Hub
    {
        public Dictionary<string, byte> groupNames = new Dictionary<string, byte>();
        public async Task JoinRoom(string roomName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            if(!groupNames.ContainsKey(roomName)) groupNames.Add(roomName, 0);
            groupNames[roomName]++;
            await Clients.Group(roomName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} joined the room.");
        }
        public async Task LeaveRoom(string roomName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
            groupNames[roomName]--;
            if (groupNames[roomName] == 0) groupNames.Remove(roomName);
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
            if (!groupNames.ContainsValue(1)) return "roomNull";

            foreach(var room in groupNames)
            {
                if (room.Value == 1) return room.Key;
            }

            return "roomNull";
        }

}
}