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
    int nRetVal = 0;

    // Initialize the WSA variables
    WSADATA wsaData;
    int nResult = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (nResult < 0) {
        cerr << "WSAStartup failed with error: " << nResult << endl;
        exit(EXIT_FAILURE);
    }

    // Initialize the socket
    int nServerSocket = socket(AF_INET, SOCK_STREAM, 0);    
    if (nServerSocket == INVALID_SOCKET || nServerSocket < 0) {
        cerr << "Socket creation failed" << endl;
        WSACleanup();
        exit(EXIT_FAILURE);
    }

    // Initialize the environment for sockaddr structure
    struct sockaddr_in serverSockaddr;
    serverSockaddr.sin_family = AF_INET;
    serverSockaddr.sin_port = htons(PORT);
    serverSockaddr.sin_addr.s_addr = inet_addr(IP_ADDRESS);
    memset(serverSockaddr.sin_zero, 0, sizeof(serverSockaddr.sin_zero));

    // Set the socket to reuse
    nRetVal = setsockopt(nServerSocket, SOL_SOCKET, SO_REUSEADDR, (char *)&serverSockaddr, sizeof(serverSockaddr));

    if(nRetVal < 0) {
        cerr << "Setsockopt failed" << endl;
        WSACleanup();
        exit(EXIT_FAILURE);
    }

    // Bind the socket to the local port
    nRetVal = bind(nServerSocket, (struct sockaddr *)&serverSockaddr, sizeof(serverSockaddr));

    if(nRetVal < 0) {
        cerr << "Bind failed" << endl;
        WSACleanup();
        exit(EXIT_FAILURE);
    }

    // Listen the request from the client (queues the requests)
    nRetVal = listen(nServerSocket, 5);

    if(nRetVal < 0) {
        cerr << "Listen failed" << endl;
        WSACleanup();
        exit(EXIT_FAILURE);
    }

    // Keep waiting for new requests and proceed as per the request

    int nMaxFd = nServerSocket;
    struct timeval tv;
    tv.tv_sec = 1;
    tv.tv_usec = 0;
    fd_set readfds, writefds, exceptfds;

    while(1) {
        FD_ZERO(&readfds);
        FD_ZERO(&writefds);
        FD_ZERO(&exceptfds);
        FD_SET(nServerSocket, &readfds);
        FD_SET(nServerSocket, &writefds);
        FD_SET(nServerSocket, &exceptfds);

        nRetVal = select(nMaxFd + 1, &readfds, &writefds, &exceptfds, &tv);

        if(nRetVal < 0) {
            cerr << "Select failed" << endl;
            WSACleanup();
            exit(EXIT_FAILURE);
        } else if (nRetVal > 0) {
            if(FD_ISSET(nServerSocket, &readfds)) {
                cout << "Read" << endl;
            }

            if(FD_ISSET(nServerSocket, &writefds)) {
                cout << "Write" << endl;
            }

            if(FD_ISSET(nServerSocket, &exceptfds)) {
                cout << "Except" << endl;
            }
            break;
        }
    }

    // Close the socket

    closesocket(nServerSocket);
    WSACleanup();

    return 0;
}
