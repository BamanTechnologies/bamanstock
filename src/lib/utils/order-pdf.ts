import { jsPDF } from "jspdf";

export type OrderPdfLineItem = {
	name: string;
	quantity: number;
	unitPrice: number;
};

export type OrderPdfData = {
	id: string;
	customer: string;
	items: number;
	amount: string;
	paymentStatus: string;
	date: string;
	orderStatus: string;
	lineItems?: OrderPdfLineItem[];
	seller?: string;
};

const PRIMARY_BLUE = "#4DA0E6";
const TEXT = "#1F2937";
const MUTED = "#6B7280";
const LIGHT_BLUE = "#EEF7FE";

function parseAmount(value: string): number {
	const amount = Number(value.replace(/[^0-9.-]+/g, ""));
	return Number.isFinite(amount) ? amount : 0;
}

function formatCurrency(value: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(value);
}

function getLineItems(order: OrderPdfData): OrderPdfLineItem[] {
	if (order.lineItems?.length) {
		return order.lineItems;
	}

	return [
		{
			name: "Order items",
			quantity: order.items,
			unitPrice: order.items > 0 ? parseAmount(order.amount) / order.items : parseAmount(order.amount),
		},
	];
}

export function downloadOrderPdf(order: OrderPdfData): void {
	const document = new jsPDF();
	const pageWidth = document.internal.pageSize.getWidth();
	const margin = 18;
	const contentWidth = pageWidth - margin * 2;
	const total = parseAmount(order.amount);
	const lineItems = getLineItems(order);
	const customerName = order.customer || "Walk-in customer";

	document.setProperties({
		title: `Order invoice ${order.id}`,
		subject: "Order details",
	});

	document.setTextColor(PRIMARY_BLUE);
	document.setFont("helvetica", "bold");
	document.setFontSize(23);
	document.text("PRODUCT INVOICE", margin, 25);

	document.setFillColor(PRIMARY_BLUE);
	document.rect(pageWidth - margin - 55, 14, 55, 16, "F");
	document.setTextColor("#FFFFFF");
	document.setFontSize(11);
	document.text(`# ${order.id}`, pageWidth - margin - 50, 24);

	document.setTextColor(MUTED);
	document.setFont("helvetica", "normal");
	document.setFontSize(9);
	document.text("Invoice date", margin, 43);
	document.text(order.date, margin + 28, 43);
	document.text("Order status", pageWidth / 2, 43);
	document.setTextColor(TEXT);
	document.text(order.orderStatus, pageWidth / 2 + 28, 43);

	document.setTextColor(PRIMARY_BLUE);
	document.setFont("helvetica", "bold");
	document.setFontSize(10);
	document.text("SELLER", margin, 61);
	document.text("CUSTOMER", pageWidth / 2, 61);

	document.setTextColor(TEXT);
	document.setFontSize(11);
	document.text(order.seller || "Baman Technologies", margin, 69);
	document.text(customerName, pageWidth / 2, 69);
	document.setTextColor(MUTED);
	document.setFont("helvetica", "normal");
	document.setFontSize(9);
	document.text("Order management and inventory", margin, 76);
	document.text(`Payment: ${order.paymentStatus}`, pageWidth / 2, 76);

	let y = 92;
	document.setFillColor(PRIMARY_BLUE);
	document.rect(margin, y, contentWidth, 10, "F");
	document.setTextColor("#FFFFFF");
	document.setFont("helvetica", "bold");
	document.setFontSize(8);
	document.text("PRODUCT NAME", margin + 3, y + 6.5);
	document.text("QTY", margin + contentWidth * 0.62, y + 6.5);
	document.text("UNIT PRICE", margin + contentWidth * 0.73, y + 6.5);
	document.text("TOTAL", margin + contentWidth - 3, y + 6.5, { align: "right" });

	y += 10;
	document.setFont("helvetica", "normal");
	lineItems.forEach((item, index) => {
		const itemTotal = item.quantity * item.unitPrice;
		document.setFillColor(index % 2 === 0 ? LIGHT_BLUE : "#FFFFFF");
		document.rect(margin, y, contentWidth, 9, "F");
		document.setTextColor(TEXT);
		document.text(item.name, margin + 3, y + 6);
		document.text(String(item.quantity), margin + contentWidth * 0.62, y + 6);
		document.text(formatCurrency(item.unitPrice), margin + contentWidth * 0.73, y + 6);
		document.text(formatCurrency(itemTotal), margin + contentWidth - 3, y + 6, { align: "right" });
		y += 9;
	});

	y += 12;
	document.setDrawColor(PRIMARY_BLUE);
	document.line(margin, y, pageWidth - margin, y);
	y += 15;
	document.setTextColor(MUTED);
	document.text(`${order.items} product${order.items === 1 ? "" : "s"}`, margin, y);
	document.text("Subtotal:", pageWidth - margin - 55, y);
	document.setTextColor(TEXT);
	document.text(formatCurrency(total), pageWidth - margin, y, { align: "right" });
	y += 9;
	document.setTextColor(MUTED);
	document.text("Tax:", pageWidth - margin - 55, y);
	document.setTextColor(TEXT);
	document.text(formatCurrency(0), pageWidth - margin, y, { align: "right" });
	y += 12;
	document.setFillColor(PRIMARY_BLUE);
	document.rect(pageWidth - margin - 55, y - 6, 55, 14, "F");
	document.setTextColor("#FFFFFF");
	document.setFont("helvetica", "bold");
	document.text("GRAND TOTAL", pageWidth - margin - 52, y + 3);
	document.text(formatCurrency(total), pageWidth - margin - 3, y + 3, { align: "right" });

	document.setTextColor(PRIMARY_BLUE);
	document.setFontSize(10);
	document.text("NOTES", margin, 246);
	document.setTextColor(MUTED);
	document.setFont("helvetica", "normal");
	document.setFontSize(9);
	document.text("Thank you for your purchase!", margin, 255);
	document.text("Please keep this invoice for your records.", margin, 262);

	document.save(`order-${order.id}.pdf`);
}
