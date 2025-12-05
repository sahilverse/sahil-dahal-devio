FROM python:3.14-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /home/sandboxuser

RUN pip install --no-cache-dir --upgrade pip 

RUN useradd -m sandboxuser && \
    mkdir -p /home/sandboxuser/tmp && \
    chown -R sandboxuser:sandboxuser /home/sandboxuser && \
    chmod 755 /home/sandboxuser && \
    chmod 777 /home/sandboxuser/tmp

USER sandboxuser

CMD ["sleep", "infinity"]
