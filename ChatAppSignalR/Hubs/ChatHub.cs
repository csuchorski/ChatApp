using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ChatAppSignalR.Hubs
{
    public class ChatHub : Hub
    {
        private static Dictionary<string, byte> groupNames = new();
        public static Dictionary<string, byte> GroupNames { get => groupNames; set => groupNames = value; }

        private static Dictionary<string, string> userAssignments = new();
        public static Dictionary<string, string> UserAssignments { get => userAssignments; set => userAssignments = value; }

        public async override Task<Task> OnDisconnectedAsync(Exception? exception)
        {
            await LeaveRoom(UserAssignments.GetValueOrDefault(Context.ConnectionId, ""));

            return base.OnDisconnectedAsync(exception);
        }
        public async Task<string> JoinRoom(string roomName)
        {
            if (!GroupNames.ContainsKey(roomName)) GroupNames.Add(roomName, 0);
            if (GroupNames[roomName] == 2)
            {
                return "failed";
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            //if (!GroupNames.ContainsKey(roomName)) GroupNames.Add(roomName, 0);
            GroupNames[roomName]++;
            UserAssignments.Add(Context.ConnectionId, roomName);
            await Clients.Group(roomName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} joined the room.", "Server");
            return "success";
        }
        public async Task LeaveRoom(string roomName)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                return;
            }

            GroupNames[roomName]--;
            if (GroupNames[roomName] == 0) GroupNames.Remove(roomName);
            UserAssignments.Remove(Context.ConnectionId);
            await Clients.Group(roomName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} left the room.", "Server"); 
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

            foreach (var room in GroupNames)
            {
                if (room.Value == 1) return room.Key;
            }

            return "roomNull";
        }

        public string GetGroupNamesAndCapacity()
        {
            var jsonResult = JsonSerializer.Serialize(GroupNames);
            //System.Diagnostics.Debug.WriteLine(jsonResult);
            return jsonResult;
        }

        public int GetNumOfUsers()
        {
            return UserAssignments.Count;
        }

        public string GetGroupOfUser()
        {
            if (UserAssignments.ContainsKey(Context.ConnectionId))
            {
                var room = UserAssignments[Context.ConnectionId];
                return room;
            }
            return "";
        }

    }
}