import csv
import os
import sys
from statistics import mean
import matplotlib.pyplot as plt

RESULTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'results')

def read_numbers(path):
    with open(path, 'r', encoding='utf8') as f:
        lines = [l.strip() for l in f if l.strip()]
    if not lines:
        return []
    if lines[0] == 'duration_ms':
        vals = [float(x) for x in lines[1:]]
    else:
        # try csv parse and assume first column is scenario or header
        try:
            reader = csv.reader(lines)
            rows = list(reader)
            vals = [float(r[0]) for r in rows[1:]]
        except Exception:
            vals = []
    return vals

def find_file(prefixes, prefer='R200'):
    files = os.listdir(RESULTS_DIR)
    for p in prefixes:
        # prefer file with prefer tag
        for f in files:
            if f.startswith(p) and prefer in f:
                return os.path.join(RESULTS_DIR, f)
        # fallback to any starting with prefix
        for f in files:
            if f.startswith(p):
                return os.path.join(RESULTS_DIR, f)
    return None

def main():
    # scenarios and file prefixes
    scenarios = [
        ('A: no cache', 'a_no_cache'),
        ('B: tanstack', 'b_tanstack_default'),
        ('C: cached', 'c_tanstack_invalidation'),
    ]

    ns = []
    means = []
    labels = []
    for label, prefix in scenarios:
        path = find_file([prefix + '_R200', prefix + '_R20', prefix])
        if not path:
            print('Missing', prefix, file=sys.stderr)
            vals = []
        else:
            vals = read_numbers(path)
        n = len(vals)
        m = mean(vals) if vals else 0
        labels.append(label)
        ns.append(n)
        means.append(m)

    # plot
    fig, ax1 = plt.subplots(figsize=(7,4))
    x = range(len(labels))
    bars = ax1.bar(x, ns, color=['#d9534f','#5bc0de','#5cb85c'])
    ax1.set_ylabel('Number of network requests')
    ax1.set_xticks(x)
    ax1.set_xticklabels(labels)
    ax1.set_ylim(0, max(ns)*1.2 if ns else 1)

    # overlay mean latency as points on secondary axis
    ax2 = ax1.twinx()
    ax2.plot(x, means, color='black', marker='o', linestyle='--')
    ax2.set_ylabel('Mean latency (ms)')
    ax2.set_ylim(0, max(means)*1.6 if means and max(means)>0 else 1)

    for i, b in enumerate(bars):
        ax1.text(b.get_x() + b.get_width()/2, b.get_height()+0.02*max(ns), str(ns[i]), ha='center', va='bottom')
        ax2.text(i, means[i]+0.02*max(means) if means else 0, f"{means[i]:.0f} ms", ha='center', va='bottom', color='black')

    plt.title('Comparação: requisições de rede e latência média por cenário')
    out = os.path.join(RESULTS_DIR, 'plot_requests_per_scenario.png')
    plt.tight_layout()
    plt.savefig(out, dpi=150)
    print('Wrote', out)

if __name__ == '__main__':
    main()
