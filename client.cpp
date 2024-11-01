#include <iostream>
#include <winsock.h>
using namespace std;

#define PORT 6969
#define IP_ADDRESS "127.0.0.1"

int main() {
    WSADATA wsaData;     
    int nResult = WSAStartup(MAKEWORD(2, 2), &wsaData);

    if (nResult < 0) {
        cerr << "WSAStartup failed with error: " << nResult << endl;
        exit(EXIT_FAILURE);
    }

    SOCKET nClientSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (nClientSocket == INVALID_SOCKET || nClientSocket < 0) {
        cerr << "Socket creation failed" << endl;
        WSACleanup();
        exit(EXIT_FAILURE); 
    }

    struct sockaddr_in clientSockaddr;
    clientSockaddr.sin_family = AF_INET;
    clientSockaddr.sin_port = htons(PORT);
    clientSockaddr.sin_addr.s_addr = inet_addr(IP_ADDRESS);
    memset(clientSockaddr.sin_zero, 0, sizeof(clientSockaddr.sin_zero));

    nResult = connect(nClientSocket, (struct sockaddr*)&clientSockaddr, sizeof(clientSockaddr));

    if (nResult < 0) {
        cerr << "Connection failed" << endl;
        WSACleanup();
        exit(EXIT_FAILURE);
    } else {
        cout << "Connected" << endl;
    }

    closesocket(nClientSocket);
    WSACleanup();
    return 0;
}