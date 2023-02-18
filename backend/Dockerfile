# syntax=docker/dockerfile:1

FROM python:3.11-slim

WORKDIR /backend

# install system dependencies
# Allow ubuntu to cache package downloads
RUN rm -f /etc/apt/apt.conf.d/docker-clean; \
    echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' \
    > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    apt-get update \
    && apt-get --no-install-recommends -y install \
    netcat \
    gcc \
    postgresql \
    && apt-get clean

# install python dependencies
RUN --mount=type=cache,target=/root/.cache pip install poetry
COPY poetry.lock pyproject.toml /backend/
# TODO: Check TESTING or LOCAL env variable to add `--with=dev` flag
RUN --mount=type=cache,target=/root/.cache poetry export --no-interaction --with=dev | pip install -r /dev/stdin

COPY . /backend
