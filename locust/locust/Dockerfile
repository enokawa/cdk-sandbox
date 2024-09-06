FROM public.ecr.aws/docker/library/python:3.12-slim

WORKDIR /locust

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

ENTRYPOINT ["locust"]
