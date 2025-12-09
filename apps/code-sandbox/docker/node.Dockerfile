FROM node:25.1-slim

WORKDIR /home/sandboxuser

RUN npm install -g tsx typescript

RUN useradd -m sandboxuser && \
    mkdir -p /home/sandboxuser/tmp && \
    chown -R sandboxuser:sandboxuser /home/sandboxuser && \
    chmod 755 /home/sandboxuser && \
    chmod 777 /home/sandboxuser/tmp 

USER sandboxuser

CMD ["sleep", "infinity"]
