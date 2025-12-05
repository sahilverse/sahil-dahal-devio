FROM gcc:15.2.0

WORKDIR /home/sandboxuser

RUN useradd -m sandboxuser && \
    mkdir -p /home/sandboxuser/tmp && \
    chown -R sandboxuser:sandboxuser /home/sandboxuser && \
    chmod 755 /home/sandboxuser && \
    chmod 777 /home/sandboxuser/tmp 

USER sandboxuser

CMD ["sleep", "infinity"]
