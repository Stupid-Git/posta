

class BufBase {
	
	//crc_table = [];

	constructor() {

		// https://gist.github.com/bewest/9559812
		//var 
		this.crc_table = [
			0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5,
			0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b,
			0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210,
			0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
			0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c,
			0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401,
			0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b,
			0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
			0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6,
			0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738,
			0xf7df, 0xe7fe, 0xd79d, 0xc7bc, 0x48c4, 0x58e5,
			0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
			0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969,
			0xa90a, 0xb92b, 0x5af5, 0x4ad4, 0x7ab7, 0x6a96,
			0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc,
			0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
			0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03,
			0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd,
			0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6,
			0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
			0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a,
			0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb,
			0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1,
			0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
			0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c,
			0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2,
			0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb,
			0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
			0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447,
			0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8,
			0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2,
			0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
			0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9,
			0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827,
			0x18c0, 0x08e1, 0x3882, 0x28a3, 0xcb7d, 0xdb5c,
			0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
			0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0,
			0x2ab3, 0x3a92, 0xfd2e, 0xed0f, 0xdd6c, 0xcd4d,
			0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07,
			0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
			0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba,
			0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74,
			0x2e93, 0x3eb2, 0x0ed1, 0x1ef0
		];
	}


	crcCCITT (input, seed) {
	  var result = seed;
	  var temp;

	  for (var i = 0, len = input.length; i < len; ++i) {
	    temp = (input[i] ^ (result >> 8)) & 0xFF;
	    result = this.crc_table[temp] ^  (result << 8);
	  }
	  return result;
	}
	
	crcCCITT (input, mylen, seed) {
	  var result = seed;
	  var temp;

	//for (var i = 0, len = input.length; i < len; ++i) {
	  for (var i = 0, len = mylen; i < len; ++i) {
	    temp = (input[i] ^ (result >> 8)) & 0xFF;
	    result = this.crc_table[temp] ^  (result << 8);
	  }
	  return result;
	}

/*
	crc16CCITT(buf, seed) // NG?
	{
	    var crc = Number.isNaN(seed) ? 0xFFFF : seed;
	    for (var i = 0, len = buf.length; i < len; ++i)
	    {
	      crc = (((crc >> 8) & 0xFF) | ((crc << 8) & 0xFFFF));
	      crc ^= buf[i];
	      crc ^= ((crc >> 4) & 0xFF);
	      crc ^= ((((crc << 8) & 0xFFFF) << 4) & 0xFFFF);
	      crc ^= (((((crc & 0xFF) << 4) & 0xFFFF) << 1) & 0xFFFF);
	    }
	    return crc;
	}
*/
	dumb1 ()
	{
	    console.log('---------------------------------------');
	    var input = new Buffer( [ 0x02, 0x06, 0x06, 0x03 ] );
	    var output = crc16CCITT(input);
	    var o = new Buffer([output >> 8, output & 0xFF]);
	    console.log('output:', output, o.toString('hex'));
	    var c = new Buffer([0x41, 0xCD]);
	    console.log("(correct is)", 0x41CD, c.toString('hex'));

	    var input = new Buffer( [ 0x02, 0x06, 0x06, 0x03 ] );
	    console.log('attempt 2');
	    output = crcCCITT(input, 0xFFFF);
	    o = new Buffer([output >> 8, output & 0xFF]);
	    console.log('output:', output, o.toString('hex'));
	    console.log("(correct is)", 0x41CD, /*c.toString('hex')*/);   
	}


	getCheckSum(datain)
	{
	    var len = datain.length;
	    var cs = 0;
	    for(var i=0; i<len; i++)
	    {
	        cs += datain[i];
	    }
	    return(cs);
	}

	
	addCheckSum(datain)
	{
	    var len = datain.length;

	    var dataout = new Uint8Array(len+2);
	    var cs = this.getCheckSum(datain);
	    var b0 = ((cs >> 0) & 0xFF);
	    var b1 = ((cs >> 8) & 0xFF);
	    for(var i=0; i<len; i++)
	    {
	        dataout[i] = datain[i];
	    }
	    dataout[i++] = b0; //LSB first
	    dataout[i++] = b1; //MSB second
	    return(dataout);
	}


	printData20(data20)
	{
	    var len = data20.length;
	    
	    //for(var i=0; i<20; i++)
	    for(var i=0; i<len; i++)
	    {
	        console.log('data20[' + i + '] = ' + data20[i].toString(16) + ' (' +data20[i].toString(10)+ ')');                
	    }
	    console.log(' data20 len = '+ data20.length);
	}

	printArray(array)
	{
	    var len = array.length;
	    for(var i=0; i<len; i++)
	    {
	        var data20 = array[i];
	        this.printData20(data20);
	    }
	}

}


class Ubuf extends BufBase {
	
	constructor() {
		super(); //BufBase.constructor();
		this.U_CMD = [];
		this.U_DAT_Array = [];
	    this.U_DAT_len = 0;
	    this.U_DAT_blocks = 0;
	}

	toPkt()
	{

	}

	process_U_pkt(upkt)
	{
	    var cmd = upkt[1];
	    var sts = upkt[2];
	    var len = upkt[4]*256 + upkt[3];
	    
	    var crc = 0x0000; //crcCCITT(upkt, 5 + len, 0x0000); // we use a 0x0000 seed
	    
	    var crcb0 = ((crc >> 0) & 0xFF);
	    var crcb1 = ((crc >> 8) & 0xFF);

	    var pktb0 = upkt[5+len+1];
	    var pktb1 = upkt[5+len+0];
	    
	    switch( cmd )
	    {
	        default:
	            console.log('cmd = ' + cmd);
	            console.log('sts = ' + sts);
	            console.log('len = ' + len);

	            console.log('cb0 = ' + crcb0);
	            console.log('pb0 = ' + pktb0);
	            console.log('cb1 = ' + crcb1);
	            console.log('pb1 = ' + pktb1);
	            
	            break;
	    }
	    
	}

	On_U_CMD(data)
	{
	    //printData20( data);
	    this.U_CMD = data;

	    var len = this.U_CMD[3] * 256 + this.U_CMD[2];
	    this.U_DAT_len = len;

	    var blocks = 1 + Math.floor((len-1)/16);
	    this.U_DAT_blocks = blocks;
	    
	    var theArray = [];
	    for(var b = 0; b<blocks; b++)
	    {
	        var data20 = new Buffer(20);
	        theArray.push(data20);
	    }
	    
	    this.U_DAT_Array = theArray;
	}



}


class Dbuf extends BufBase {
	
	constructor() {
		super(); //BufBase.constructor();
		this.D_CMD = [];
		this.D_DAT_Array = [];
	}

	make_D_CMD( len )
	{
	    var data20 = new Buffer(20);

	    data20.writeInt8( 1, 0);
	    data20.writeInt8( 1, 1);
	    data20.writeInt8( ((len>>0) & 0xff) , 2);
	    data20.writeInt8( ((len>>8) & 0xff) , 3);
	    return(data20);
	}

	make_D_DAT_Array( datain )
	{
	    //console.log('');
	    var len = datain.length;
	    //var quotient = Math.floor(y/x);
	    //var remainder = y % x;
	    var blocks = 1 + Math.floor((len-1)/16);
	    var theArray = [];
	    //console.log('len    = ' + len);
	    //console.log('blocks = ' + blocks);
	    for(var b = 0; b<blocks; b++)
	    {
	        var data20 = new Buffer(20);

	        data20.writeInt8( b, 0);
	        data20.writeInt8( 0, 1);
	        data20.writeInt8( 0, 2);
	        data20.writeInt8( 0, 3);

	        for(var i=4; i<20; i++)
	        {
	            data20.writeUInt8( datain[ b*16 + (i-4)], i);
	          //data20[i] = datain[ b*16 + (i-4)];
	            //console.log('data20[' + i + '] = ' + data20[i].toString(16) );
	        }
	        theArray.push(data20);
	    }
	    //console.log('theArray = ' + theArray);
	    //console.log('theArray.length = ' + theArray.length);
	    return(theArray);
	}

	fix0x1Packet(pkt)
	{
		var lenH = pkt.length;

		var cmd = pkt[1];
		var sts = pkt[2];
	    var len = pkt[4]*256 + pkt[3];
	    
	    var crc = this.crcCCITT(pkt, 5 + len, 0x0000); // we use a 0x0000 seed
	    
	    var crcb0 = ((crc >> 0) & 0xFF);
	    var crcb1 = ((crc >> 8) & 0xFF);

	    var pktb0 = pkt[5+len+1];
	    var pktb1 = pkt[5+len+0];

	    if( lenH === (len + 7) ) { // all there
	    	pkt[5+len+0] = crcb1; // Force crc even if it was correct
	  		pkt[5+len+1] = crcb0; // Force crc even if it was correct
	  		return(pkt);
	    }

	    if( lenH === (len + 5) ) { // missing last
	        var dataout = new Uint8Array(len+5+2);	        
		    for(var i=0; i<len; i++)
		    {
		        dataout[i] = pkt[i];
		    }
		    dataout[i++] = crcb1; //crc MSB first
		    dataout[i++] = crcb0; //crc LSB second
		    return(dataout);
	    }
    
    	return(null); // we were screwed anyway
	}


	fromPkt( pkt )
	{
		var goodPkt = this.fix0x1Packet(pkt);
		//console.log('  fromPkt: goodPkt.length = ' + goodPkt.length);
		var longPkt = this.addCheckSum(goodPkt);
		//console.log('  fromPkt: longPkt.length = ' + longPkt.length);
		this.D_CMD = this.make_D_CMD(longPkt.length);
		this.D_DAT_Array = this.make_D_DAT_Array(longPkt);
		//console.log('  fromPkt: D_DAT_Array.length = ' + this.D_DAT_Array.length);
	}

	get_D_CMD()
	{    
	    return( this.D_CMD );
	}

	get_D_DAT( idx )
	{    
		//console.log('  get_D_DAT: D_DAT_Array.length = ' + this.D_DAT_Array.length + ' asking for idx =' + idx);
	    return( this.D_DAT_Array[idx] );
	}

	get_D_DAT_count()
	{    
		//console.log('  get_D_DAT_count: D_DAT_Array.length = ' + this.D_DAT_Array.length);
	    return( this.D_DAT_Array.length );
	}

}


module.exports = { BufBase, Dbuf, Ubuf };
//NG export  { BufBase, Dbuf, Ubuf };


