FROM envoyproxy/envoy:v1.24.1

EXPOSE 80
EXPOSE 443

COPY config/envoy.yaml /etc/envoy.yaml

CMD /usr/local/bin/envoy -c /etc/envoy.yaml