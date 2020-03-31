# Messenger-ws, A Manti-Core Plugin
This is an experimental plugin for inter-node communications in a multinode setup. This plugin can be deployed into the Manti-Core Platform. Once deployed, it will start a Websocket server on port stated in the `WSPORT` env variables. It will allow connections from other deployed Manti-Core server if they share the same platform key and data encryption key.

Individual nodes when started will register or check if the node has been registered in the database with IP address with the network interface defined in the env variables, `NODE_INTF_NAME` and the default port defined as `NODE_MSG_WS_PORT`.

## Getting Started

This project requires the Manti-Core Platform to be deployed.

### Prerequisites
NodeJS - v12.16.1 

MySQL - 8.0.17 Community Server

(Because the project is developed and tested on these version)

### Installing
Use the Manti-Core Platform's Package/Plugin Manager to install the plugin.

## Built With
- MS Visual Studio Code

## Version
- v0.0.1 Beta Release
Known issues:
1) Not resync messages when there is a breakage in network with other servers
2) Not able to override messaging port configured in the env variables
3) No web UI to remove "dead node" entries in the database

## Authors
Tay Qiaowei