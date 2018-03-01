var BufBase = require('./rembleD/remble-bufs').BufBase;
var bb = new BufBase();

var Proc01 = class {

    constructor()
    {        
    }

    dumpHex(pkt)
    {
        var len = pkt.length;
        //console.log('dumpHex len = ' + len );

        for(var i=0; i<len; )
        {
            var S = "";
            var C = "";
            for(var j=0; j<16; j++)
            {
                var pos = i + j;
                if( j==8 ) {
                    S += ' ';
                    C += ' ';
                }

                if(pos>=len)
                {
                    S += '   ';
                    C += ' ';
                } else {
                    var _byte =  pkt[pos];
                    var h = ("00" + _byte.toString(16)).substr(-2); // "034f"
                    h = h.toUpperCase();
                    var s = ' ' + h;            
                    S += s;

                    var letterNumber = /^[0-9a-zA-Z]+$/;
                    var chr = String.fromCharCode(_byte);
                    if (chr.match(letterNumber)) {
                        C += chr;
                    } else {
                        C += '.';
                    }
                }
            }
            console.log( S + '    ' + C );
            i += 16;
        }

    }

    setCrc(pkt, dataLen)
    {
	    var crc = bb.crcCCITT(pkt, 5 + dataLen, 0x0000); // we use a 0x0000 seed
	    
	    var crcb0 = ((crc >> 0) & 0xFF);
	    var crcb1 = ((crc >> 8) & 0xFF);

	    pkt[5+dataLen+0] = crcb1;
	    pkt[5+dataLen+1] = crcb0;
    }

    setCs(pkt, dataLen)
    {
        //var len = pkt[4]*256 + pkt[3];
	    var cs = 0;
	    for(var i=0; i<(5 + dataLen); i++)
	    {
	        cs += pkt[i];
	    }
	    var b0 = ((cs >> 0) & 0xFF);
	    var b1 = ((cs >> 8) & 0xFF);
	    pkt[5+dataLen+0] = b0; //LSB first
	    pkt[5+dataLen+1] = b1; //MSB second
	}


    dump_41(rData)
    {
        const buf = Buffer.from(rData);
        console.log('============================ dump_41 S ================================');
        //console.log('dump_41 rData length = ' + buf.length);
        //this.dumpHex(buf);
        var len = (buf[4]<<8) + buf[3];
        var count = len >> 1;
        console.log('dump_41 len   = ' + len);
        console.log('dump_41 count = ' + count);
        var i = 0;
        console.log('Temp = ' + buf.readUInt16LE(5 + i * 2) + ', ' + (buf.readUInt16LE(5 + i * 2) - 1000)/10.0 );
        //for (var i=0; i< count; i++){
        //    console.log('Temp = ' + buf.readUInt16LE(5 + i * 2) + ', ' + (buf.readUInt16LE(5 + i * 2) - 1000)/10.0 );
        //}
        console.log('============================ dump_41 E ================================');
    }
    
    dump_48(rData)
    {
        const buf = Buffer.from(rData);
        console.log('============================ dump_48 S ================================');


        console.log('[00]record_int    = ' + buf.readUInt16LE(5 + 0)); //uint16_t	record_int;			// 0,1		記録間隔[秒]
        console.log('[02]start_time    = ' + buf[12] + buf[11] + buf[10] + buf[9] + buf[8] + buf[7] + buf[6] + buf[5] );
        //uint8_t		start_time[8];		// 2-9		記録開始日時(GMT)
		console.log('[10]start_way     = ' + buf.readUInt8   (5 + 10)); //uint8_t		start_way;			// 10		記録開始方法　(0x00/0x01)=(即時/予約)
		console.log('[11]rec_mode      = ' + buf.readUInt8   (5 + 11)); //uint8_t		rec_mode;			// 11		記録モード　(0x00/0x80)=(エンドレス/ワンタイム)
		console.log('[12]rsv_time      = ' + buf.readUInt32LE(5 + 12)); //uint32_t	rsv_time;			// 12-15	予約待ち時間 (吸い上げ時は最終記録からの経過秒数))
		console.log('[16]disp_unit     = ' + buf.readUInt8   (5 + 16)); //uint8_t		disp_unit;			// 16		LCD表示単位　(0x00/0x01)=(C/F)
		//console.log('[17]RF_mask       = ' + buf.readUInt8   (5 + 17)); //uint8_t		RF_mask;			// 17		無線マスク(未使用)
		console.log('[18]sensor code   = ' + buf.readUInt8   (5 + 18)); //uint8_t		moni_intt;			// 18		モニタ間隔(未使用)
		//console.log('[19]ch1_war_time  = ' + buf.readUInt8   (5 + 19)); //uint8_t		ch1_war_time;		// 19		ch1警報監視時間
		//console.log('[20]ch1_lo_limit  = ' + buf.readUInt16LE(5 + 20)); //uint8_t		ch1_lo_limit[2];	// 20,21	ch1上限
		//console.log('[22]ch1_hi_limit  = ' + buf.readUInt16LE(5 + 22)); //uint8_t		ch1_hi_limit[2];	// 22,23	ch1下限
		//console.log('[24]ch2_war_time  = ' + buf.readUInt8   (5 + 24)); //uint8_t		ch2_war_time;		// 24		ch2警報監視時間
        console.log('[26]last_data_no  = ' + buf.readUInt32LE(5 + 26));
		//console.log('[25]ch2_lo_limit  = ' + buf.readUInt16LE(5 + 25)); //uint8_t		ch2_lo_limit[2];	// 25,26	ch2上限
		//console.log('[27]ch2_hi_limit  = ' + buf.readUInt16LE(5 + 27)); //uint8_t		ch2_hi_limit[2];	// 27,28	ch2下限
		//console.log('[29]keiho_flag    = ' + buf.readUInt8   (5 + 29)); //uint8_t		keiho_flag;			// 29		警報ON/OFFフラグ
        console.log('[30]data_size     = ' + buf.readUInt16LE(5 + 30)); //uint16_t	data_size;			// 30,31	
		console.log('[32]all_data_size = ' + buf.readUInt16LE(5 + 32)); //uint16_t	all_data_size;		// 32,33	
		console.log('[34]end_data_size = ' + buf.readUInt16LE(5 + 34)); //uint16_t	end_data_size;		// 34,35	
		console.log('[36]serial_No     = ' + buf.readUInt32LE(5 + 36).toString(16)); //uint32_t	serial_No;			// 36-39	シリアル番号
        console.log('[40]bat_level     = ' + buf.readUInt8   (5 + 40)); //uint8_t		dummy1;				// 40		
		//uint8_t		disp_mode;			// 41 UNUSED
        console.log('[42]CH1 Type      = ' + buf.readUInt8   (5 + 42)); //uint8_t		ch1_zoku;			// 42		ch1記録属性
		console.log('[43]CH2 Type      = ' + buf.readUInt8   (5 + 43)); //uint8_t		ch2_zoku;			// 43		ch2記録属性
        console.log('[44]CH1           = ' + buf.readUInt16LE(5 + 44) + ', ' + (buf.readUInt16LE(5 + 44) - 1000)/10.0 );
        console.log('[46]CH2           = ' + buf.readUInt16LE(5 + 46) + ', ' + (buf.readUInt16LE(5 + 46) - 1000)/10.0 );
		//uint16_t	model_code;			// 62,63	機種コード
		console.log('[62]model_code    = ' + buf.readUInt16LE(5 + 62).toString(16)); //uint16_t	end_data_size;		// 34,35	
        
/*        
		//memcpy((uint8_t*)&UART2_Tx_buff[26 + 5], (uint8_t*)&rec_no, 4);		// [26-29]データ番号(4byte)設定
        console.log('[26]last_data_no  = ' + buf.readUInt32LE(5 + 26));
        // 30,31 番地に転送byte数を入れる
        console.log('[30]cpt_rec_count = ' + buf.readUInt16LE(30 + 5));
		// 32,33 番地に総記録byte数を入れる
        console.log('[32]rec_count = ' + buf.readUInt16LE(32 + 5));
		// 34,35 番地にデータ番号を入れる
        console.log('[34]rec_no    = ' + buf.readUInt16LE(34 + 5));
		// 36,37,38,39 番地にシリアルNoを入れる
        console.log('[36]serial_no = ' + buf.readUInt32LE(36 + 5).toString(16));
		//UART2_Tx_buff[40 + 5] = bat_level;			// 40 番地にBATレベルを入れる
        console.log('[40]bat_level = ' + buf.readUInt8(40 + 5));
		//memcpy((uint8_t*)&UART2_Tx_buff[44 + 5], (uint8_t*)&real_temp[0], 2);		// [44-45]Ch1現在値
        console.log('[44]CH1      = ' + buf.readUInt16LE(44 + 5));
        console.log('[44]CH1      = ' + (buf.readUInt16LE(44 + 5) - 1000)/10.0 );
		//memcpy((uint8_t*)&UART2_Tx_buff[46 + 5], (uint8_t*)&real_temp[1], 2);		// [46-47]Ch2現在値
        console.log('[46]CH2      = ' + buf.readUInt16LE(46 + 5));

		//UART2_Tx_buff[56 + 5] = REC_START_CNT;		// 56番地に記録開始回数カウンタセット
*/
        //1個目のデータのeepromｱﾄﾞﾚｽを求める。
/*
		STM_EEPROM_adr = ((uint32_t)epr_pointer + ((uint32_t)r_ad.Ep_Data_END + 1)) - (uint32_t)cpt_rec_count_[idx];
		if (STM_EEPROM_adr >= (r_ad.Ep_Data_END + 1))STM_EEPROM_adr -= ((uint32_t)r_ad.Ep_Data_END + 1);
		read_ptr_[idx] = (uint16_t)STM_EEPROM_adr;
*/
        console.log('============================ dump_48 E ================================');
    }

    dump_69(rData)
    {
        const buf = Buffer.from(rData);
        console.log('============================ dump_69 S ================================');
        //this.dumpHex(rData);
        
        //memcpy((uint8_t*)&UART2_Tx_buff[5], (uint8_t*)&setup500_table, sizeof(setup500_table));	// 設定テーブル
        /* only keep first 20 bytes
        uint16_t	record_int;			// 0,1		記録間隔[秒]
		uint8_t		start_time[8];		// 2-9		記録開始日時(GMT)
		uint8_t		start_way;			// 10		記録開始方法　(0x00/0x01)=(即時/予約)
		uint8_t		rec_mode;			// 11		記録モード　(0x00/0x80)=(エンドレス/ワンタイム)
		uint32_t	rsv_time;			// 12-15	予約待ち時間 (吸い上げ時は最終記録からの経過秒数))
		uint8_t		disp_unit;			// 16		LCD表示単位　(0x00/0x01)=(C/F)
		uint8_t		RF_mask;			// 17		無線マスク(未使用)
		uint8_t		moni_intt;			// 18		モニタ間隔(未使用)
        uint8_t		ch1_war_time;		// 19		ch1警報監視時間
        */


		//r_size = Revision;
		//memcpy((uint8_t*)&UART2_Tx_buff[25], (uint8_t *)&r_size, 2);				// Mainファームバージョン
		//memcpy((uint8_t*)&UART2_Tx_buff[27], (uint8_t *)&BLE_Ver, 2);				// BLEファームバージョン
		//memcpy((uint8_t*)&UART2_Tx_buff[29], (uint8_t *)&BLE_Batt, 2);			// 電池電圧 電池電圧×1000
		//memcpy((uint8_t*)&UART2_Tx_buff[31], (uint8_t *)&BLE_Batt_R, 2);			// 電池電圧 電池電圧×1000
		//UART2_Tx_buff[33] = bat_level;						// 電池残量レベル
		//UART2_Tx_buff[34] = RECORD;							// 記録状態 記録中:1,予約待ち中:2,停止中:0
		//memcpy((uint8_t*)&UART2_Tx_buff[41], (uint8_t *)&system_table.serial_num, 4);	// シリアル番号
		//memcpy((uint8_t*)&UART2_Tx_buff[37], (uint8_t*)&rec_count, 2);				// 総記録バイト数

		//memcpy((uint8_t*)&UART2_Tx_buff[69], (uint8_t*)&WF_ALM, 64);			// 警報設定
		//memcpy((uint8_t*)&UART2_Tx_buff[133], (uint8_t*)&name_table, sizeof(name_table));		// 機器名、チャンネル名

		//memcpy((uint8_t*)&UART2_Tx_buff[197], (uint8_t*)&setup_table2.TrendCh1, 8);		// アジャストメントデータ
		//memcpy((uint8_t*)&UART2_Tx_buff[205], (uint8_t*)&setup_table2.cal_date[0], 4);	// アジャストメントデータ

		//FLASH_Read(0x08080000, (uint8_t*)&UART2_Tx_buff[229], 64);			// システム動作設定
		//UART2_Tx_buff[3] = 0x20;	// 応答データバイト長
		//UART2_Tx_buff[4] = 0x01;	// 応答データバイト長

        console.log('============================ dump_69 E ================================');
    }

    dump_9e(rData)
    {
        const buf = Buffer.from(rData);
        console.log('============================ dump_9e_00 S ================================');
        this.dumpHex(rData);

        //UART2_Tx_buff[3] = 0x38;		// データバイト長
        //UART2_Tx_buff[4] = 0x00;		// データバイト長

        console.log('[00]BLE Security Code = ' + buf.readUInt32LE(5 + 0).toString(16));  // memcpy((uint8_t*)&UART2_Tx_buff[5], &BLE_setting.BLE_seqcode[0], 4);			// BLE通信のセキュリティコード
        console.log('[04]name table        = ' + buf.readUInt32LE(5 + 4));  // memcpy((uint8_t*)&UART2_Tx_buff[9], &name_table.unit_name[0], 26);			// 機器名、グループ名
        var nameStr = buf.toString('utf8', 5 + 4, 5 + 4 + 16);
        var grpStr  = buf.toString('utf8', 5 + 4 + 16, 5 + 4 + 16 + 10);
        console.log('[04]Name              = \"' + nameStr + ' \"');
        console.log('[20]Group             = \"' + grpStr + ' \"');

        console.log('[30]SIG Company Id    = ' + buf.readUInt16LE(5 + 30).toString(16)); // UART2_Tx_buff[35] = 0x92; UART2_Tx_buff[36] = 0x03;	// Company ID
        console.log('[32]Serial            = ' + buf.readUInt32LE(5 + 32).toString(16)); // memcpy((uint8_t*)&UART2_Tx_buff[37], (uint8_t *)&system_table.serial_num, 4);	// シリアル番号
        console.log('[36]Security Off/On   = ' + buf.readUInt8   (5 + 36)); // if ((WF_DC.WlanSEC & 0x10) == 0)	UART2_Tx_buff[41] = 0; セキュリティＯＦＦ UART2_Tx_buff[41] = 1;	 セキュリティＯＮ
        //UART2_Tx_buff[42] = 0x01;
        console.log('[38] Ch1 Raw          = ' + buf.readUInt16LE(5 + 38)); //memcpy((uint8_t*)&UART2_Tx_buff[43], (uint8_t *)&real_temp[0], 2);			// 現在値Ch1
        console.log('[40] Ch2 Raw          = ' + buf.readUInt16LE(5 + 40)); //memcpy((uint8_t*)&UART2_Tx_buff[45], (uint8_t *)&real_temp[1], 2);			// 現在値Ch2
        console.log('[42]batt level        = ' + buf.readUInt8   (5 + 42)); // UART2_Tx_buff[47] = bat_level;												// 電池残量

        //r_size = ((Revision & 0x0F00) >> 8) * 100;
        //r_size = r_size + (((Revision & 0x00F0) >> 4) * 10);
        //r_size = r_size + (Revision & 0x000F);
        //if(r_size > 99)r_size = r_size - 100;	// Ver1.00 --> 0(1.00未満は数値そのまま)
        console.log('[43]micro Rev         = ' + buf.readUInt8   (5 + 43)); //UART2_Tx_buff[48] = r_size;				// mainファームのバージョン

        //r_size = ((BLE_Ver & 0x0F00) >> 8) * 100;
        //r_size = r_size + (((BLE_Ver & 0x00F0) >> 4) * 10);
        //r_size = r_size + (BLE_Ver & 0x000F);
        //if(r_size > 99)r_size = r_size - 100;	// Ver1.00 --> 0(1.00未満は数値そのまま)
        console.log('[44]ble  level        = ' + buf.readUInt8   (5 + 44)); //UART2_Tx_buff[49] = r_size;				// BLEファームのバージョン

        console.log('============================ dump_9e_00 E ================================');
    }

    getPkt_41( download_para )
    {  
        var len = 4
        var sData = new Uint8Array(len+5+2);	        

        sData[0] = 0x01;
        sData[1] = 0x41;
        sData[2] = 0x00;

        sData[3] = 0x04;
        sData[4] = 0x00;

        var sum = download_para; //UInt16.Parse(download_para);
        sData[5] = (sum>>0) & 0x0ff;
        sData[6] = (sum>>8) & 0x0ff;
        sData[7] = 0x00;
        sData[8] = 0x00;

        sData[9] = 0xcc; // make space for checksum
        sData[10] = 0xcc;  // make space for checksum

	    var dataLen = sData[4]*256 + sData[3];
        this.setCs(sData, dataLen);
        //this.addCrc(sData, len);

        return( sData );
    }

    getPkt_48( download_mode, download_para )
    {  
        var len = 4
        var sData = new Uint8Array(len+5+2);	        

        sData[0] = 0x01;
        sData[1] = 0x48;
        sData[2] = 0x00;

        sData[3] = 0x04;
        sData[4] = 0x00;

        switch (download_mode)
        {
            case 'all': // "全データ吸い上げ":
                sData[5] = 0x00;
                sData[6] = 0x00;
                break;

            case 'bytes': //"バイト数指定":
                var sum = download_para; //UInt16.Parse(download_para);
                sData[5] = (sum>>0) & 0x0ff;
                sData[6] = (sum>>8) & 0x0ff;
                break;

            case 'block': //"データ番号指定":
                sData[1] = 0x49;
                var sum = download_para; //UInt16.Parse(download_para);
                sData[5] = (sum>>0) & 0x0ff;
                sData[6] = (sum>>8) & 0x0ff;
                break;
        }
        sData[7] = 0x00;
        sData[8] = 0x00;

        sData[9] = 0xcc; // make space for checksum
        sData[10] = 0xcc;  // make space for checksum

	    var dataLen = sData[4]*256 + sData[3];
        this.setCs(sData, dataLen);
        //this.addCrc(sData, len);

        return( sData );
    }

    getPkt_69()
    {
        var len = 4
        //var sData = Array(7);
        //var sData = Array(11);
        var sData = new Uint8Array(len+5+2);	        

        sData[0] = 0x01;
        sData[1] = 0x69;
        sData[2] = 0x00;

        sData[3] = 0x04;
        sData[4] = 0x00;

        sData[5] = 0x00;
        sData[6] = 0x00;
        sData[7] = 0x00;
        sData[8] = 0x00;

        sData[9] = 0xcc; // make space for checksum
        sData[10] = 0xcc;  // make space for checksum

	    var dataLen = sData[4]*256 + sData[3];
        this.setCs(sData, dataLen);
        //this.addCrc(sData, len);

        return( sData );
    }

    getPkt_9e00()
    {
        var len = 0
        //var sData = Array(7);
        var sData = new Uint8Array(len+5+2);	        

        sData[0] = 0x01;
        sData[1] = 0x9e;
        sData[2] = 0x00;

        sData[3] = 0x00;
        sData[4] = 0x00;

        sData[5] = 0xcc; // make space for CRC
        sData[6] = 0xcc;  // make space for CRC

	    var dataLen = sData[4]*256 + sData[3];
        this.setCrc(sData, dataLen);

        return( sData );
    }

    makePkt_9f(pkt, idNumber)
    {
        var payloadlen = pkt.length + 4;
        var buf = new Uint8Array(5 + payloadlen + 2);
        
        buf[0] = 0x01;
        buf[1] = 0x9f;
        buf[2] = 0x00;
        buf[3] = (payloadlen>>0) & 0x0ff;
        buf[4] = (payloadlen>>8) & 0x0ff;

        buf[5] = (idNumber>>0) & 0x0ff;
        buf[6] = (idNumber>>8) & 0x0ff;
        buf[7] = (idNumber>>16) & 0x0ff;
        buf[8] = (idNumber>>24) & 0x0ff;

        for(var i=0; i< pkt.length ; i++)
            buf[9 + i] = pkt[i];
    
        var dataLen = buf[4]*256 + buf[3];
        this.setCrc(buf, dataLen);

        return( buf );
    }

    fromPkt_9f(pkt)
    {
        var payloadLen = pkt[4]*256 + pkt[3];

        let rData = new Uint8Array(payloadLen);
        for( var i = 0; i<payloadLen; i++){
            rData[i] = pkt[5 + i];
        }
        return(rData);
    }
    
    test1()
    {
        //var pkt = this.getPkt_48('all', 0);
        var pkt = this.getPkt_48('bytes', 0x1234);
        this.dumpHex(pkt);
        pkt = this.makePkt_9f(pkt, 0x11223344);
        this.dumpHex(pkt);
      
        var pkt = this.getPkt_69();
        this.dumpHex(pkt);
        pkt = this.makePkt_9f(pkt, 0x11223344);
        this.dumpHex(pkt);

        var pkt = this.getPkt_9e00();
        this.dumpHex(pkt);
    }
}


module.exports = { Proc01 };

