const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================
// PRINTER TEST
// ============================================

router.post('/test', function(req, res) {
    var printerName = req.body.printerName || 'XP-80C';
    var text = req.body.text || 'Test page from Pop-agro-product\n';
    
    console.log('🖨️ Printer test:', printerName);
    
    var tempFile = path.join(__dirname, '../temp_print.txt');
    
    try {
        fs.writeFileSync(tempFile, text, 'utf8');
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Fayl yozish xatosi: ' + err.message });
    }
    
    var command = 'print /D:"' + printerName + '" "' + tempFile + '"';
    
    exec(command, function(error, stdout, stderr) {
        try {
            fs.unlinkSync(tempFile);
        } catch (e) {}
        
        if (error) {
            console.error('❌ Printer xatosi:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Printer xatosi: ' + error.message 
            });
        }
        
        console.log('✅ Printer test muvaffaqiyatli!');
        res.json({ 
            success: true, 
            message: 'Printer test muvaffaqiyatli!',
            printer: printerName
        });
    });
});

// ============================================
// CHEKNI PRINTERGA YUBORISH
// ============================================

router.post('/print', function(req, res) {
    var printerName = req.body.printerName || 'XP-80C';
    var text = req.body.text || '';
    
    if (!text) {
        return res.status(400).json({ success: false, message: 'Chek matni bo\'sh!' });
    }
    
    console.log('🖨️ Chek printerga yuborilmoqda:', printerName);
    
    var tempFile = path.join(__dirname, '../temp_receipt.txt');
    
    try {
        fs.writeFileSync(tempFile, text, 'utf8');
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Fayl yozish xatosi: ' + err.message });
    }
    
    var command = 'print /D:"' + printerName + '" "' + tempFile + '"';
    
    exec(command, function(error, stdout, stderr) {
        try {
            fs.unlinkSync(tempFile);
        } catch (e) {}
        
        if (error) {
            console.error('❌ Printer xatosi:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Printer xatosi: ' + error.message 
            });
        }
        
        console.log('✅ Chek printerga yuborildi!');
        res.json({ 
            success: true, 
            message: 'Chek printerga yuborildi!',
            printer: printerName
        });
    });
});

// ============================================
// PRINTER RO'YXATINI OLISH
// ============================================

router.get('/list', function(req, res) {
    var command = 'powershell -Command "Get-Printer | Select-Object Name, PrinterStatus, PortName | ConvertTo-Json"';
    
    exec(command, function(error, stdout, stderr) {
        if (error) {
            console.error('❌ Printer ro\'yxati xatosi:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Printer ro\'yxati olishda xatolik' 
            });
        }
        
        try {
            var printers = JSON.parse(stdout);
            if (!Array.isArray(printers)) {
                printers = [printers];
            }
            res.json({ 
                success: true, 
                data: printers 
            });
        } catch (e) {
            res.json({ 
                success: true, 
                data: [] 
            });
        }
    });
});

module.exports = router;