

const rb2_tags = {
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

const SCANSTART_WEB        = 'scanStart:web';         // Down
const SCANSTOP_WEB         = 'scanStop:web';          // Down
const SCANDATA_WEB         = 'scanData:web';          // Up
const SCANSTARTED_WEB      = 'scanStarted:web';       // Up
const SCANSTOPPED_WEB      = 'scanStopped:web';       // Up

const SCANSTART_REM        = 'scanStart:rem';         // Down
const SCANSTOP_REM         = 'scanStop:rem';          // Down
const SCANDATA_REM         = 'scanData:rem';          // Up
const SCANSTARTED_REM      = 'scanStarted:rem';       // Up
const SCANSTOPPED_REM      = 'scanStopped:rem';       // Up