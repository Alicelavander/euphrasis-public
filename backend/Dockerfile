FROM python:3.10
ENV PYTHONUNBUFFERED=1

WORKDIR /src

# lp-music-capsの分
COPY /requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# musicgenの分
RUN pip install --upgrade pip
RUN pip install --upgrade transformers scipy

RUN apt-get -y update
RUN apt-get install -y libsndfile1
RUN apt install -y ffmpeg

COPY ./app /app
COPY ./ml /ml

ENTRYPOINT ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--reload"]