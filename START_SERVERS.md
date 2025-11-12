# How to Start All Servers

## Quick Start (3 Commands in 3 Terminals)

### Terminal 1 - REST API Server (Port 8080)
```powershell
cd "C:\xampp\htdocs\My Project\network-assigment-library-management-system\backend"
java -cp "target/classes;target/dependency/*" com.oaktown.library.RestApiServer
```

### Terminal 2 - WebSocket Chat Server (Port 8081)
```powershell
cd "C:\xampp\htdocs\My Project\network-assigment-library-management-system\backend"
java -cp "target/classes;target/dependency/*" com.oaktown.library.WebSocketChatServer
```

### Terminal 3 - Frontend (Port 3000)
```powershell
cd "C:\xampp\htdocs\My Project\network-assigment-library-management-system\frontend"
npm run dev
```

## Verify Servers Are Running

Check this in a new terminal:
```powershell
# Check for Java processes (should see 2)
Get-Process java -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count

# Check ports (should see 8080 and 8081)
netstat -ano | findstr "8080.*LISTENING"
netstat -ano | findstr "8081.*LISTENING"
```

## Access the Application

- **Admin Dashboard**: http://localhost:3000
- **Member Chat**: http://localhost:3000/member-chat

## Common Issues

### "Address already in use"
- A server is already running on that port
- Kill the process: `Stop-Process -Id <ProcessId> -Force`
- Or restart your computer

### "Class not found"
- Run from the `backend` directory
- Recompile: `mvn clean compile`
- Rebuild dependencies: `mvn dependency:copy-dependencies -DoutputDirectory=target/dependency`

### WebSocket keeps reconnecting
- WebSocket server (port 8081) is not running
- Check Terminal 2 output
- Make sure no firewall is blocking port 8081

### Messages not sending
- Both REST API and WebSocket servers must be running
- Check browser console for errors
- Verify connection indicator shows green dot

## Stop All Servers

Press `Ctrl+C` in each terminal window to stop the servers gracefully.
