const Dashboard = {
    showModule() {
        const mainView = document.getElementById('main-view');
        if (!mainView) return;

        mainView.innerHTML = `
            <div class="animate-in fade-in duration-500 p-4 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-blue-500 text-white p-6 rounded-lg shadow-md relative overflow-hidden">
                        <h3 class="text-3xl font-bold">150</h3>
                        <p class="text-sm">Pesanan Baru</p>
                        <i class="fa fa-shopping-cart absolute right-4 top-4 text-4xl opacity-20"></i>
                    </div>
                    <div class="bg-emerald-500 text-white p-6 rounded-lg shadow-md relative overflow-hidden">
                        <h3 class="text-3xl font-bold">53%</h3>
                        <p class="text-sm">Rasio Pantulan</p>
                        <i class="fa fa-chart-bar absolute right-4 top-4 text-4xl opacity-20"></i>
                    </div>
                    <div class="bg-amber-400 text-white p-6 rounded-lg shadow-md relative overflow-hidden">
                        <h3 class="text-3xl font-bold">44</h3>
                        <p class="text-sm">Registrasi User</p>
                        <i class="fa fa-user-plus absolute right-4 top-4 text-4xl opacity-20"></i>
                    </div>
                    <div class="bg-rose-500 text-white p-6 rounded-lg shadow-md relative overflow-hidden">
                        <h3 class="text-3xl font-bold">65</h3>
                        <p class="text-sm">Pengunjung Unik</p>
                        <i class="fa fa-pie-chart absolute right-4 top-4 text-4xl opacity-20"></i>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 class="font-bold mb-4 text-slate-700">Nilai Penjualan</h3>
                    <div class="h-[300px]">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
            </div>
        `;

        this.initChart();
    },

    initChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Penjualan',
                    data: [30, 50, 40, 60, 80, 50],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
};

window.Dashboard = Dashboard;