import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const formatAddress = (address) => {
  return `${address.name}
${address.street}
${address.city}, ${address.state} ${address.postalCode}
${address.country}
Phone: ${address.phone}`;
};

const generateInvoice = (order) => {
  const doc = new PDFDocument({ 
    margin: 50,
    size: 'A4',
    bufferPages: true
  });
  
  // Register fonts
  doc.registerFont('Inter-Bold', path.join(__dirname, '../../public/fonts/Inter-Bold.ttf'));
  
  // Generate invoice number
  const invoiceNumber = `INV-${order._id.toString().slice(-6)}-${new Date(order.createdAt).getFullYear()}`;
  
  // Header with Logo
  doc.image(path.join(__dirname, '../../public/logo.png'), 50, 45, { width: 100 })
     .font('Inter-Bold')
     .fontSize(20)
     .text('INVOICE', 200, 50, { align: 'right' })
     .moveDown(2);

  // Company & Customer Info
  doc.fontSize(10)
     .text(`Invoice #: ${invoiceNumber}`, { align: 'right' })
     .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' })
     .moveDown()
     .text('Billed To:', { underline: true })
     .text(formatAddress(order.shippingAddress))
     .moveDown()
     .text('From:', { underline: true })
     .text(`Frameely\n123 Frame Street\nMumbai, MH 400001\nGSTIN: 27ABCDE1234F1Z5`);

  // Line Items Table
  const tableTop = 300;
  doc.font('Helvetica-Bold')
     .text('Description', 50, tableTop)
     .text('Size', 250, tableTop)
     .text('Qty', 350, tableTop)
     .text('Price', 400, tableTop, { width: 100, align: 'right' })
     .text('Total', 500, tableTop, { width: 100, align: 'right' })
     .moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

  let y = tableTop + 30;
  order.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    doc.font('Helvetica')
       .text(item.frame.name, 50, y)
       .text(item.size, 250, y)
       .text(item.quantity.toString(), 350, y)
       .text(`₹${item.price.toFixed(2)}`, 400, y, { align: 'right' })
       .text(`₹${itemTotal.toFixed(2)}`, 500, y, { align: 'right' });
    y += 25;
  });

  // Calculate totals
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = subtotal * 0.18; // 18% GST
  const total = subtotal + gst;

  // Total Calculation
  doc.moveTo(50, y + 20).lineTo(550, y + 20).stroke()
     .font('Helvetica-Bold')
     .text('Subtotal:', 350, y + 30)
     .text(`₹${subtotal.toFixed(2)}`, 500, y + 30, { align: 'right' })
     .text('GST (18%):', 350, y + 50)
     .text(`₹${gst.toFixed(2)}`, 500, y + 50, { align: 'right' })
     .moveTo(50, y + 70).lineTo(550, y + 70).stroke()
     .text('Total Amount:', 350, y + 80)
     .text(`₹${total.toFixed(2)}`, 500, y + 80, { align: 'right' });

  // Payment Information
  doc.moveDown(2)
     .font('Helvetica-Bold')
     .text('Payment Information:', { underline: true })
     .font('Helvetica')
     .text(`Payment Method: ${order.paymentMethod}`)
     .text(`Transaction ID: ${order.paymentId}`)
     .text(`Status: ${order.paymentStatus}`);

  // Footer
  doc.fontSize(8)
     .text('Thank you for choosing Frameely!', 50, 780, { align: 'center' })
     .text('Returns accepted within 7 days of delivery', 50, 800, { align: 'center' })
     .text('For any queries, contact: support@frameely.com', 50, 820, { align: 'center' });

  return doc;
};

export default generateInvoice; 