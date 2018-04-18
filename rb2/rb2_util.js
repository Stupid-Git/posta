

rb2_tags = {
    RB2_STARTSCAN_R : 'rb2StartScan_Rem',       // DN - 
    RB2_STOPSCAN_R : 'rb2StopScan_Rem',         // DN - 
    RB2_ADVDATA_R : 'rb2AdvData_Rem',           // UP - 

    RB2_CONNECT_R : 'rb2Connect_Rem',           // DN - 
    RB2_DISCONNECT_R : 'rb2Disconnect_Rem',     // DN - 
    RB2_CONSTATUS_R : 'rb2ConStatus_Rem',       // UP - 

    RB2_UDSEND_R : 'rb2UDSend_Rem',             // DN - 
    RB2_UDSENT_R : 'rb2UDSend_Rem',             // UP - 
    RB2_UDRECV_R : 'rb2UDRecv_Rem',             // UP - 
}

//=============================================================================
SCANSTART_WEB        = 'scanStart:web';         // Down
SCANSTOP_WEB         = 'scanStop:web';          // Down
SCANDATA_WEB         = 'scanData:web';          // Up
SCANSTARTED_WEB      = 'scanStarted:web';       // Up
SCANSTOPPED_WEB      = 'scanStopped:web';       // Up

//=============================================================================
SCANSTART_REM        = 'scanStart:rem';         // Down
SCANSTOP_REM         = 'scanStop:rem';          // Down
SCANDATA_REM         = 'scanData:rem';          // Up
SCANSTARTED_REM      = 'scanStarted:rem';       // Up
SCANSTOPPED_REM      = 'scanStopped:rem';       // Up

//=============================================================================
CONNECT_REM          = 'connect:rem';           // Down
DISCONNECT_REM       = 'disconnect:rem';        // Down
DISCONNECTED_DEV     = 'disconnected:dev';      // Up (from noble ...)
CONNECTIONSTATUS_REM = 'connectionStatus:rem';  // Up

//=============================================================================
DNPKT_REM            = 'dnPkt:rem';             // Down
DNPKTSENTCFM_REM     = 'dnPktSentCfm:rem';      // Up
UPPKTRDY_DEV         = 'upPktRdy:dev';          // Up (from noble ...)
UPPKT_REM            = 'upPkt:rem';             // Up

