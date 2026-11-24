$(document).ready(function () {
  var items = [];
  var customerName = "";
  var prevDues = 0;
  var amountPaid = 0;
  var invoiceCounter = 357; // Starting number matching your image

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

    if (customerName.trim() !== "" && itemName !== "" && itemPrice !== "" && !isNaN(itemQty) && itemQty > 0) {
      var item = { name: itemName, price: parseFloat(itemPrice), qty: itemQty };
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

      updateTotals();
      $("#item-name").val("").focus();
      $("#item-price").val("");
      $("#item-qty").val("");
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
      updateTotals(); 
    }
  }

  function updateTotals() {
    var totalCost = 0; 
    var totalQty = 0;
    
    items.forEach(function (item) { 
      totalCost += item.price * item.qty; 
      totalQty += item.qty; 
    });
    
    $("#total-cost").text("₹" + totalCost.toFixed(2));
    $("#total-qty").text(totalQty);

    var totalAmt = totalCost + prevDues;
    $("#total-amount").text("₹" + totalAmt.toFixed(2));
    $("#current-due").text("₹" + (totalAmt - amountPaid).toFixed(2));
  }

  $("#prev-dues").on("input", function () { 
    prevDues = parseFloat($(this).val()) || 0; 
    updateTotals(); 
  });
  
  $("#amount-paid").on("input", function () { 
    amountPaid = parseFloat($(this).val()) || 0; 
    updateTotals(); 
  });
  
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

    var totalCost = 0; 
    var totalQty = 0;
    items.forEach(function (item) { 
      totalCost += item.price * item.qty; 
      totalQty += item.qty; 
    });
    
    var totalAmt = totalCost + prevDues;
    var currentDue = totalAmt - amountPaid;

    var now = new Date();
    var hours = now.getHours(); 
    var minutes = now.getMinutes(); 
    
    // Format Time
    var displayHours = hours % 12;
    displayHours = displayHours ? displayHours : 12;
    var displayMinutes = minutes < 10 ? "0" + minutes : minutes;
    var timeStr = displayHours + ":" + displayMinutes;
    
    // Format Date
    var dd = String(now.getDate()).padStart(2, "0");
    var mm = String(now.getMonth() + 1).padStart(2, "0");
    var yyyy = now.getFullYear();
    var dateStr = dd + "-" + mm + "-" + yyyy;

    var safeName = customerName.replace(/[^a-zA-Z0-9]/g, "_");
    var filename = safeName + "_" + dateStr + ".pdf";
    
    // Invoice Number Logic
    invoiceCounter++;
    var invNo = String(invoiceCounter).padStart(6, '0');

    // Build Invoice HTML
    var invoiceHtml = `
      <div class="thermal-receipt" id="thermal-invoice">
        <div class="text-center mb-2">
          <div style="font-size: 16px;">ASGHAR ALI (RINKU)</div>
          <div style="font-size: 12px;">Hospital Road, Near Sadhu Medical</div>
        </div>
        
        <div class="dotted-line"></div>
        
        <div class="text-center receipt-title">ESTIMATE</div>
        
        <div class="dotted-line"></div>
        
        <div class="meta-row mb-1">
          <span>NO.${invNo}</span>
          <span>SLM- 0 ${dateStr}</span>
        </div>
        
        <div class="dotted-line"></div>
        
        <div class="meta-row" style="margin-bottom: 4px;">
          <span>Bill To: ${customerName}</span>
        </div>
        
        <table class="receipt-table">
          <thead>
            <tr>
              <th class="col-sn">S.N</th>
              <th class="col-desc">DESCRIPTION</th>
              <th class="col-qty text-right">QTY</th>
              <th class="col-rate text-right">RATE</th>
              <th class="col-amt text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
    `;

    items.forEach(function (item, index) {
      var sn = String(index + 1).padStart(3, '0');
      invoiceHtml += `
        <tr>
          <td>${sn}</td>
          <td style="text-transform: uppercase;">${item.name}</td>
          <td class="text-right">${item.qty.toFixed(2)}</td>
          <td class="text-right">${item.price.toFixed(2)}</td>
          <td class="text-right">${(item.price * item.qty).toFixed(2)}</td>
        </tr>
      `;
    });

    invoiceHtml += `
          </tbody>
        </table>
        
        <div class="dotted-line"></div>
        
        <div class="subtot-row">
          <span>SUB_TOT ITM= ${items.length}</span>
          <span>Q=${totalQty.toFixed(2)}</span>
          <span>${totalCost.toFixed(2)}</span>
        </div>
        
        <div class="dotted-line"></div>
        
        <div class="subtot-row total-row-big">
          <span>TOTAL</span>
          <span>${totalAmt.toFixed(2)}</span>
        </div>
        
        <div class="dotted-line"></div>
        
        <div class="footer-msg">
          <span>THANKS FOR VISIT........HAVE A NICE DAY</span>
        </div>
        <div class="footer-msg mb-2">
          <span>C G</span>
          <span>${hours}:${minutes}:${now.getSeconds()} M/C NO 1</span>
        </div>
        
        <div class="print-btn" style="text-align: center; margin-top: 15px;">
          <button onclick="window.print()" style="padding: 5px 15px; font-weight: bold; font-family: sans-serif;">PRINT</button>
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
          <link rel="stylesheet" href="style.css">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js"><\/script>
          <style>
            body { display: flex; justify-content: center; background: #ccc; padding: 20px; }
            .thermal-receipt { background: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.2); }
          </style>
        </head>
        <body>
          ${invoiceHtml}
          <script>
            window.onload = function() {
              var element = document.getElementById('thermal-invoice');
              var opt = {
                margin:       0,
                filename:     '${filename}',
                image:        { type: 'jpeg', quality: 1 },
                html2canvas:  { scale: 4, useCORS: true },
                jsPDF:        { unit: 'mm', format: [80, 200], orientation: 'portrait' }
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
