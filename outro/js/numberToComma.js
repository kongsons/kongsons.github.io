var NumberComma =
{
	numberComma : function (itvalue)	//異붽�
	{
		var Rz = '';
		var Rs = '';
		var Rc = 0;
		itvalue = parseInt(itvalue);
		var Rh = (itvalue < 0) ? 1 : 0;
		itvalue += '';
		var Orglength = itvalue.length;
		
		for(var i = Orglength; i >= 0 ; i--) 
		{
			Rz = itvalue.charAt(i);
			Rs = Rz + Rs;
			if(Rc % 3 == 0 && i > Rh && i < Orglength) 
			{
				Rs = ',' + Rs;
			}
			Rc++;
		}
		return (Rs);
	},
	
	numberCommaCancel	:	function (tnum)	//��젣
	{
		var num=tnum.toString();
		var arr=num.split(",");
		var return_value = "";
		
		for (var i=0;i<=arr.length-1;i++)
		{
			return_value += arr[i];
		}
		return return_value;
	},

	number_format	:	function (numstr, ret)
	{
		numstr = this.numberCommaCancel(numstr);
		numstr = this.numberComma(numstr);

		numstr=(numstr=='NaN' || numstr=='' || numstr=='undefind') ? 0 : numstr;

		if(ret)
		{
			ret.value = numstr;
		}
		return numstr;
	}
};