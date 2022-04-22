using Microsoft.AspNetCore.SignalR;

namespace ChatAppSignalR.Hubs
{
    public class ChatHub : Hub
    {
        public Dictionary<string, bool> groupNames = new Dictionary<string, bool>();
        public async Task JoinRoom(string roomName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            await Clients.Group(roomName).SendAsync("ReceiveMessage",$"{Context.ConnectionId} joined the room.");
        }
        public async Task LeaveRoom(string roomName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
            await Clients.Group(roomName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} left the room.");
        }
        
        public string FindRoom()
        {
            foreach(var room in groupNames)
            {
                if (room.Value) return room.Key;
            }
            return "roomNull";        
        }

    }
}