FROM envoyproxy/envoy:v1.24.1

# Create necessary directories and set permissions
RUN mkdir -p /tmp && \
    chmod 777 /tmp

EXPOSE 8080
EXPOSE 8443
EXPOSE 8001

COPY config/envoy.yaml /etc/envoy.yaml

# Ensure proper ownership and permissions for the config file
RUN chown 1000:1000 /etc/envoy.yaml

USER 1000

CMD ["/usr/local/bin/envoy", "-c", "/etc/envoy.yaml", "--log-level", "info"]