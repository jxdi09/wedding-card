// การตั้งค่า ID ของ Google Sheets และ Google Drive
const SHEET_ID = '1SWTKRYBwIWteCNYXmdVcMv0XZtNQ5StjySeXUlRaBKw';
const FOLDER_ID = '1ifdN_77tsFQYBstBJvzPXYd3ykGYMw0X';

function doPost(e) {
  try {
    // กำหนดให้ตอบกลับเป็น JSON และแก้ปัญหา CORS
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Content-Type": "application/json"
    };

    // ตรวจสอบว่ามีการส่งข้อมูลมาหรือไม่
    if (typeof e !== 'undefined' && e.postData && e.postData.contents) {
      // แปลงข้อมูล JSON ที่ส่งมาจากหน้าเว็บ
      const data = JSON.parse(e.postData.contents);
      
      // ข้อมูลผู้ใช้
      const name = data.name || "ไม่ระบุ";
      const relation = data.relation || "-";
      const attending = data.attending || "-";
      const message = data.message || "-";
      const slipBase64 = data.slip || null;
      
      // เราให้ Amount (จำนวนเงิน) เป็นค่าว่างเพื่อให้คุณไปเติมเองตอนเช็คสลิป
      const amount = "-"; 
      
      let slipUrl = "ไม่มีสลิป";

      // 1. จัดการเซฟไฟล์ภาพสลิปลง Google Drive
      if (slipBase64) {
        // แยกส่วน Base64 string เช่น "data:image/jpeg;base64,....."
        const base64Data = slipBase64.split(',')[1];
        if (base64Data) {
          const decodedData = Utilities.base64Decode(base64Data);
          const blob = Utilities.newBlob(decodedData, MimeType.JPEG, `Slip_${name}_${new Date().getTime()}.jpg`);
          
          const folder = DriveApp.getFolderById(FOLDER_ID);
          const file = folder.createFile(blob);
          
          // ทำให้ไฟล์สามารถดูได้โดยทุกคนที่มีลิงก์ (เพื่อให้บ่าวสาวเปิดดูง่ายๆ)
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          
          slipUrl = file.getUrl();
        }
      }

      // 2. บันทึกข้อมูลลง Google Sheets
      const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
      
      // Timestamp ของปัจจุบัน
      const timestamp = new Date();
      
      // ลำดับข้อมูลต้องตรงกับคอลัมน์ใน Sheet 
      // | Timestamp | Name | Relation | Attending | Amount | Message | Slip_URL |
      sheet.appendRow([timestamp, name, relation, attending, amount, message, slipUrl]);

      // ส่งข้อความกลับไปบอกหน้าเว็บว่า "สำเร็จ"
      return ContentService.createTextOutput(JSON.stringify({ 
        "status": "success", 
        "message": "Data saved successfully" 
      })).setMimeType(ContentService.MimeType.JSON);

    } else {
      throw new Error("No data received");
    }
  } catch (error) {
    // กรณีมีข้อผิดพลาด
    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "error", 
      "message": error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ฟังก์ชันรองรับ OPTIONS (Preflight request ของระบบ Fetch)
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
