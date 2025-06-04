FROM alpine:latest

RUN apk add --no-cache curl bzip2 bash

WORKDIR /

ARG TARGETARCH
ARG KIWIX_VERSION=3.7.0

RUN mkdir -p /kiwix/tools

RUN ARCH_MAP=`if [ "$TARGETARCH" = "arm64" ]; then echo "aarch64"; else echo "x86_64"; fi` \
    && curl -k -L -o kiwix-tools.tar.gz https://download.kiwix.org/release/kiwix-tools/kiwix-tools_linux-${ARCH_MAP}-${KIWIX_VERSION}.tar.gz \
    && tar xf kiwix-tools.tar.gz \
    && mv kiwix-tools_linux-${ARCH_MAP}-${KIWIX_VERSION}/* /kiwix/tools/ \
    && rm -rf kiwix-tools.tar.gz kiwix-tools_linux-${ARCH_MAP}-${KIWIX_VERSION}

COPY library.xml /kiwix/tools/

COPY entrypoint.sh /kiwix/tools/
RUN chmod +x /kiwix/tools/entrypoint.sh

WORKDIR /kiwix/tools

VOLUME /kiwix-data

EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh"]