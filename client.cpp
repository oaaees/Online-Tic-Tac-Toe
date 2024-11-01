#include <iostream>
#include <winsock.h>
using namespace std;

#define PORT 6969
#define IP_ADDRESS "127.0.0.1"

int main() {
    WSADATA wsaData;
    int startupResult = WSAStartup(MAKEWORD(2, 2), &wsaData);

    if (startupResult != 0) {
        cerr << "WSAStartup failed with error: " << startupResult << endl;
        exit(EXIT_FAILURE);
    }

    SOCKET socketHandle = socket(AF_INET, SOCK_STREAM, 0);
    if (socketHandle == INVALID_SOCKET) {
        cerr << "Socket creation failed" << endl;
        WSACleanup();
        exit(EXIT_FAILURE);
    }

    sockaddr_in serverAddress;
    serverAddress.sin_family = AF_INET;
    serverAddress.sin_port = htons(PORT);
    serverAddress.sin_addr.s_addr = inet_addr(IP_ADDRESS);
    memset(serverAddress.sin_zero, 0, sizeof(serverAddress.sin_zero));

    int connectResult = connect(socketHandle, (struct sockaddr*)&serverAddress, sizeof(serverAddress));

    if (connectResult != 0) {
        cerr << "Connection failed" << endl;
        closesocket(socketHandle);
        WSACleanup();
        exit(EXIT_FAILURE);
    }

    closesocket(socketHandle);
    WSACleanup();
    return 0;
}
