$(document).ready(function () {
  var items = [];
  var customerName = "";
  var prevDues = 0;
  var amountPaid = 0;

  $("#item-form").on("submit", addItemToCart);
  $("#cart-table").on("click", ".btn-danger", removeItemFromCart);
  $("#generate-invoice").on("click", generateInvoice);

  $("#item-form input").on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItemToCart(e);
    }
  });

  function addItemToCart(event) {
    event.preventDefault();

    var itemName = $("#item-name").val().trim();
    var itemPrice = $("#item-price").val().trim();
    var itemQty = parseInt($("#item-qty").val());

    if (
      customerName.trim() !== "" &&
      itemName !== "" &&
      itemPrice !== "" &&
      !isNaN(itemQty) &&
      itemQty > 0
    ) {
      var item = {
        name: itemName,
        price: parseFloat(itemPrice),
        qty: itemQty,
      };

      items.push(item);

      $("#cart-table tbody").append(
        "<tr>" +
          '<td class="cart-item-name">' + item.name + "</td>" +
          '<td class="cart-price">₹' + item.price.toFixed(2) + "</td>" +
          '<td class="cart-qty">' + item.qty + "</td>" +
          '<td class="cart-amount">₹' + (item.price * item.qty).toFixed(2) + "</td>" +
          '<td><button class="btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button></td>' +
        "</tr>"
      );

      updateTotalCost();
      updateTotalQty();
      updateTotalAmt();

      $("#item-name").val("");
      $("#item-price").val("");
      $("#item-qty").val("");
      $("#item-name").focus();
    } else {
      alert("Please fill customer name, item name, valid qty and price.");
    }
  }

  function removeItemFromCart() {
    var row = $(this).closest("tr");
    var index = row.index();
    if (index >= 0) {
      items.splice(index, 1);
      row.remove();
      updateTotalCost();
      updateTotalQty();
      updateTotalAmt();
    }
  }

  function updateTotalCost() {
    var totalCost = 0;
    items.forEach(function (item) {
      totalCost += item.price * item.qty;
    });
    $("#total-cost").text("₹" + totalCost.toFixed(2));
  }

  $("#prev-dues").on("input", function () {
    prevDues = parseFloat($(this).val()) || 0;
    updateTotalAmt();
  });

  $("#amount-paid").on("input", function () {
    amountPaid = parseFloat($(this).val()) || 0;
    updateCurrentDue();
  });

  function updateTotalAmt() {
    var totalAmt = 0;
    items.forEach(function (item) {
      totalAmt += item.price * item.qty;
    });
    totalAmt += prevDues;
    $("#total-amount").text("₹" + totalAmt.toFixed(2));
    updateCurrentDue();
  }

  function updateCurrentDue() {
    var totalAmt = 0;
    items.forEach(function (item) {
      totalAmt += item.price * item.qty;
    });
    totalAmt += prevDues;
    var currentDue = totalAmt - amountPaid;
    $("#current-due").text("₹" + currentDue.toFixed(2));
  }

  function updateTotalQty() {
    var totalQty = 0;
    items.forEach(function (item) {
      totalQty += item.qty;
    });
    $("#total-qty").text(totalQty);
  }

  function getCurrentDate() {
    var currentDate = new Date();
    var dd = String(currentDate.getDate()).padStart(2, "0");
    var mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    var yyyy = currentDate.getFullYear();
    return dd + "/" + mm + "/" + yyyy;
  }

  function getTotalQty() {
    var totalQty = 0;
    items.forEach(function (item) {
      totalQty += item.qty;
    });
    return totalQty;
  }

  function getTotalCost() {
    var totalCost = 0;
    items.forEach(function (item) {
      totalCost += item.price * item.qty;
    });
    return totalCost;
  }

  $("#customer-name").on("input", function () {
    customerName = $(this).val().trim();
  });

  function generateInvoice() {
    if (items.length === 0) {
      alert("No items added.");
      return;
    }
    if (!customerName) {
      alert("Please enter customer name.");
      return;
    }

    var totalCost = getTotalCost();
    var totalAmt = totalCost + prevDues;
    var currentDue = totalAmt - amountPaid;
    var totalQty = getTotalQty();

    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var timeStr = hours + ":" + minutes + " " + ampm;
    var dateStr = getCurrentDate();

    var safeName = customerName.replace(/[^a-zA-Z0-9]/g, "_");
    var filename = safeName + "_" + dateStr.replace(/\//g, "-") + ".pdf";

    var invoiceHtml = `
      <div class="invoice-container" id="thermal-invoice">
        <div class="container mt-1">
      <h3 class="shop-title text-center mb-0" id="savePdfButton"> 
      <img src="1770261049335.jpg" 
     alt="logo" style="width:295px; height:85px; display:block; margin:0 auto;" /> </h3>

        <div class="bill-row">
          <span></span>
          <span>TM: ${timeStr}</span>
          <span>${dateStr}</span>
        </div>

     <hr />
      
        <div class="bill-row">
          <span>Bill To: ${customerName}</span>
        </div>
        <hr />
        
        <table>
          <thead>
            <tr>
              <th style="width:8%;">SN</th>
              <th style="width:42%;">ITEMS</th>
              <th style="width:10%; text-align:right;">QTY</th>
              <th style="width:20%; text-align:right;">RATE</th>
              <th style="width:20%; text-align:right;">AMNT</th>
            </tr>
          </thead>
          <tbody>
    `;

    items.forEach(function (item, index) {
      // Using Math.round to remove .00 and display as integer
      invoiceHtml += `
        <tr>
          <td>${index + 1}</td>
          <td class="invoice-item-name">${item.name}</td>
          <td class="text-right">${item.qty}</td>
          <td class="text-right">₹${Math.round(item.price)}</td>
          <td class="text-right">₹${Math.round(item.price * item.qty)}</td>
        </tr>
      `;
    });

    invoiceHtml += `
          </tbody>
        </table>
        <div class="footer-line"><span>T QTY:</span><span>${totalQty}</span></div>
        <div class="footer-line total-line"><span>Prev. Dues:</span><span>₹${Math.round(prevDues)}</span></div>
        <div class="footer-line"><span>TOTAL:</span><span>₹${Math.round(totalAmt)}</span></div>
        <div class="footer-line"><span>Amount Paid:</span><span>₹${Math.round(amountPaid)}</span></div>
        <div class="footer-line"><span>Current Due:</span><span>₹${Math.round(currentDue)}</span></div>
        <hr />
        <div class="thanks">THANKS FOR VISIT</div>
        <div class="print-btn">
          <button onclick="window.print()"><i class="fas fa-print"></i> PRINT</button>
        </div>
      </div>
    `;

    var popup = window.open("", "_blank", "width=460,height=720");
    popup.document.open();
    popup.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${filename}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js"><\/script>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              background: #fff;
              margin: 0;
              padding: 8px;
              display: flex;
              justify-content: center;
            }
            .invoice-container {
              width: 80mm;
              max-width: 80mm;
              background: #fff;
              padding: 8px 6px 12px;
              font-size: 17px;
              line-height: 1.5;
              color: #000;
              font-weight: 900;
              border: 1px solid #ccc;
              font-family: 'Courier New', Courier, monospace;
            }
            
            hr {
              border: none;
              border-top: 2px dashed #000;
              margin: 8px 0;
              opacity: 0.9;
            }
            .bill-row {
              display: flex;
              justify-content: space-between;
              font-size: 20px;
              font-weight: 900;
              margin: 2px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 15px; /* Slightly reduced to help fit content */
              font-weight: 800;
              margin: 2px 0;
              table-layout: fixed;
            }
            th, td {
              padding: 2px 1px;
              border-bottom: 1.5px dotted #666;
              word-wrap: break-word;
              overflow-wrap: break-word;
              white-space: nowrap; /* Prevent wrapping unless necessary */
            }
            th {
              text-align: left;
              font-weight: 900;
              border-bottom: 2.5px solid #000;
              font-size: 16px;
              text-transform: uppercase;
              letter-spacing: 0.4px;
            }
            .text-right {
              text-align: right;
            }
            .invoice-item-name {
              text-transform: uppercase;
              font-weight: 900;
              font-size: 15px;
              letter-spacing: 0.1px;
              text-align: left !important;
              line-height: 1.2;
              white-space: normal; /* Allow item names to wrap if very long */
            }
            .footer-line {
              display: flex;
              justify-content: space-between;
              font-weight: 900;
              margin: 5px 0;
              font-size: 17px;
            }
            .total-line {
              font-weight: 900;
              font-size: 20px;
              border-top: 3px solid #000;
              padding-top: 5px;
              margin-top: 5px;
              letter-spacing: 0.2px;
            }
            .thanks {
              text-align: center;
              font-weight: 900;
              margin-top: 10px;
              font-size: 17px;
              letter-spacing: 1px;
            }
            .print-btn {
              text-align: center;
              margin-top: 14px;
            }
            .print-btn button {
              background: #000;
              color: #fff;
              border: none;
              padding: 8px 20px;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
              border-radius: 4px;
            }
            .print-btn button:hover {
              background: #333;
            }
            @media print {
              body { padding: 0; background: #fff; }
              .print-btn { display: none; }
              .invoice-container { border: none; }
            }
          </style>
        </head>
        <body>
          ${invoiceHtml}
          <script>
            window.onload = function() {
              var element = document.getElementById('thermal-invoice');
              var opt = {
                margin:       0.05,
                filename:     '${filename}',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 3, letterRendering: true, useCORS: true },
                jsPDF:        { unit: 'mm', format: [80, 260], orientation: 'portrait' }
              };
              html2pdf().set(opt).from(element).save();
            };
          <\/script>
        </body>
      </html>
    `);
    popup.document.close();
  }
});
