FROM python:3.11-slim

WORKDIR /app

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py run.py ./
COPY templates/ ./templates/
COPY static/ ./static/

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "run.py"]