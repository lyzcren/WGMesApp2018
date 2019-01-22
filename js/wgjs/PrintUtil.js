(function($, owner) {
	owner.OutputStream = null;

	owner.init = function(BluetoothSocket) {
		owner.OutputStream = BluetoothSocket.getOutputStream();
		plus.android.importClass(owner.OutputStream);
	}

	// 设置字体大小
	owner.SetFontSize = function(n) {
		var font = [0x1D, 0X21, n]
		owner.OutputStream.write(font);
	};

	// 打印字符串
	owner.PrintString = function(string) {
		var bytes = plus.android.invoke(string, 'getBytes', 'gbk');
		owner.OutputStream.write(bytes);
	};

	// 重置打印机
	owner.Reset = function() {
		var reset = [0x1B, 0X40];
		owner.OutputStream.write(reset);
	};

	// 打印下划线
	owner.Underline = function() {
		// 下划线指令
		var underline = [0x1b, 0x2d, 0x01];
		owner.OutputStream.write(underline);
	};

	// 结束打印
	owner.End = function() {
		owner.OutputStream.flush();
		var end = [0x1d, 0x4c, 0x1f, 0x00];
		owner.OutputStream.write(end);
	};

	// 打印图片（暂不可用）
	owner.Picture = function() {
		var picture = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1B, 0x40, 0x1B, 0x33, 0x00];
		// var picture = [0x1B, 0x2A];
		owner.OutputStream.write(picture);
	};

	// 切纸（暂不可用）
	owner.CutPage = function() {
		// 发送切纸指令  
		var end = [0x1B, 0x69];
		owner.OutputStream.write(end);
	};

	// 条形码打印(暂不可用)
	owner.PrintBarcode = function(n) {
		var barcode = [0x1D, 0x6B, 65, 5, 11, 12, 3, 6, 23];
		owner.OutputStream.write(barcode);
	};
}(mui, window.PrintUtil = {}));