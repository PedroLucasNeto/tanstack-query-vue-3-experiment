FROM python:3.11-slim
WORKDIR /app
# Install runtime deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy only the measure folder content
COPY . /app

# Install required Python package
RUN pip install --no-cache-dir matplotlib

CMD ["python", "plot_summary.py"]
