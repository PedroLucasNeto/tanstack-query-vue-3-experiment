import os
import csv
from statistics import mean
import matplotlib.pyplot as plt

RESULTS = os.path.join(os.path.dirname(__file__), '..', 'results')

def read_vals(path):
    with open(path, 'r', encoding='utf8') as f:
        lines = [l.strip() for l in f if l.strip()]
    if not lines:
        return []
    if lines[0] == 'duration_ms':
        return [float(x) for x in lines[1:]]
    # fallback CSV
    rows = list(csv.reader(lines))
    return [float(r[0]) for r in rows[1:] if r]

def find_file(prefix, scale_order):
    files = os.listdir(RESULTS)
    for suf in scale_order:
        name = f"{prefix}_{suf}.csv"
        if name in files:
            return os.path.join(RESULTS, name)
    # fallback to prefix.csv
    alt = f"{prefix}.csv"
    if alt in files:
        return os.path.join(RESULTS, alt)
    return None

def main():
    scales = ['R20', 'R200', 'R2000']
    scale_runs = [20, 200, 2000]
    scenarios = [
        ('A_no_cache', 'a_no_cache'),
        ('B_tanstack', 'b_tanstack_default'),
        ('C_cached', 'c_tanstack_invalidation'),
    ]

    results_n = {s[0]: [] for s in scenarios}
    results_mean = {s[0]: [] for s in scenarios}

    for suf in scales:
        for key, prefix in scenarios:
            path = find_file(prefix, scales)
            if path and suf in os.path.basename(path):
                vals = read_vals(path)
            else:
                # try specific suffix
                candidate = os.path.join(RESULTS, f"{prefix}_{suf}.csv")
                vals = read_vals(candidate) if os.path.exists(candidate) else []
            results_n[key].append(len(vals))
            results_mean[key].append(mean(vals) if vals else 0)

    # plot requests vs scale
    plt.figure(figsize=(8,4))
    for key in results_n:
        plt.plot(scale_runs, results_n[key], marker='o', label=key)
    plt.xscale('log')
    plt.xlabel('RUNS (log scale)')
    plt.ylabel('Number of network requests')
    plt.title('Network requests vs scale (A, B, C)')
    plt.legend()
    out1 = os.path.join(RESULTS, 'plot_scales_requests.png')
    plt.tight_layout()
    plt.savefig(out1, dpi=150)
    print('Wrote', out1)

    # plot mean latency vs scale
    plt.figure(figsize=(8,4))
    for key in results_mean:
        plt.plot(scale_runs, results_mean[key], marker='o', label=key)
    plt.xscale('log')
    plt.xlabel('RUNS (log scale)')
    plt.ylabel('Mean latency (ms)')
    plt.title('Mean latency vs scale (A, B, C)')
    plt.legend()
    out2 = os.path.join(RESULTS, 'plot_scales_latency.png')
    plt.tight_layout()
    plt.savefig(out2, dpi=150)
    print('Wrote', out2)

if __name__ == '__main__':
    main()
