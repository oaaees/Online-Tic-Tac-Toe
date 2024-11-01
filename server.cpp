#include <iostream>
#include <winsock.h>
// you have to compile with -lws2_32
using namespace std;

#define PORT 6969
#define IP_ADDRESS "127.0.0.1"

struct sockaddr_in sockaddr;
fd_set fr, fw, fe;
int nMaxFd = 0;

int main (){
    int result = 0;

    // Initialize the WSA variables
    WSADATA wsaData;
    result = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (result < 0) {
        cerr << "WSAStartup failed with error: " << result << endl;
        exit(EXIT_FAILURE);
    }

    // Initialize the socket
    int serverSocket = socket(AF_INET, SOCK_STREAM, 0);    
    if (serverSocket == INVALID_SOCKET) {
        cerr << "Socket creation failed" << endl;
        WSACleanup();
        exit(EXIT_FAILURE);
    }

    // Initialize the environment for sockaddr structure
    sockaddr_in serverSockaddr;
    serverSockaddr.sin_family = AF_INET;
    serverSockaddr.sin_port = htons(PORT);
    serverSockaddr.sin_addr.s_addr = inet_addr(IP_ADDRESS);
    memset(serverSockaddr.sin_zero, 0, sizeof(serverSockaddr.sin_zero));

    // Set the socket to reuse
    result = setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, (char *)&serverSockaddr, sizeof(serverSockaddr));
    if (result < 0) {
        cerr << "Setsockopt failed" << endl;
        WSACleanup();
        exit(EXIT_FAILURE);
    }

    // Bind the socket to the local port
    result = bind(serverSocket, (struct sockaddr *)&serverSockaddr, sizeof(serverSockaddr));
    if (result < 0) {
        cerr << "Bind failed" << endl;
        WSACleanup();
        exit(EXIT_FAILURE);
    }

    // Listen the request from the client (queues the requests)
    result = listen(serverSocket, 5);
    if (result < 0) {
        cerr << "Listen failed" << endl;
        WSACleanup();
        exit(EXIT_FAILURE);
    }

    // Initialize the environment for select
    fd_set readfds, writefds, exceptfds;
    int maxFd = serverSocket;
    struct timeval tv;
    tv.tv_sec = 1;
    tv.tv_usec = 0;

    while (true) {
        FD_ZERO(&readfds);
        FD_ZERO(&writefds);
        FD_ZERO(&exceptfds);
        FD_SET(serverSocket, &readfds);
        FD_SET(serverSocket, &writefds);
        FD_SET(serverSocket, &exceptfds);

        result = select(maxFd + 1, &readfds, &writefds, &exceptfds, &tv);
        if (result < 0) {
            cerr << "Select failed" << endl;
            WSACleanup();
            exit(EXIT_FAILURE);
        } else if (result > 0) {
            if (FD_ISSET(serverSocket, &readfds)) {
                cout << "Read" << endl;
            }

            if (FD_ISSET(serverSocket, &writefds)) {
                cout << "Write" << endl;
            }

            if (FD_ISSET(serverSocket, &exceptfds)) {
                cout << "Except" << endl;
            }
            break;
        }
    }

    // Close the socket
    closesocket(serverSocket);
    WSACleanup();

    return 0;
}
