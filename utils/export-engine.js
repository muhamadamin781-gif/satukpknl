/**
 * Utils: Export Engine - SATU-SERANG
 * Menangani konversi data ke CSV dan optimasi cetak PDF
 */
const ExportEngine = {
    // Ekspor array of objects ke CSV
    toCSV: function(data, fileName) {
        if (!data || !data.length) return alert("Tidak ada data untuk diekspor");

        const headers = Object.keys(data[0]).join(",");
        const rows = data.map(obj => Object.values(obj).join(",")).join("\n");
        const csvContent = headers + "\n" + rows;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Fungsi Print dengan Template Kop Surat Kemenkeu
    printDirect: function(elementId, title) {
        const content = document.getElementById(elementId).innerHTML;
        const win = window.open('', '', 'height=700,width=900');
        
        win.document.write(`
            <html>
                <head>
                    <title>${title}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="p-10">
                    <div class="flex items-center justify-between border-b-4 border-double border-slate-800 pb-4 mb-8">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Logo_Kementerian_Keuangan_Republik_Indonesia.png/600px-Logo_Kementerian_Keuangan_Republik_Indonesia.png" class="h-16">
                        <div class="text-right">
                            <h1 class="text-xl font-black uppercase">Kementerian Keuangan RI</h1>
                            <h2 class="text-lg font-bold uppercase">KPKNL SERANG</h2>
                            <p class="text-[10px]">Laporan Terintegrasi Satu-Serang</p>
                        </div>
                    </div>
                    <h3 class="text-center font-bold uppercase mb-6 underline">${title}</h3>
                    ${content}
                </body>
            </html>
        `);
        
        win.document.close();
        setTimeout(() => { win.print(); win.close(); }, 500);
    }
};