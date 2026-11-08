import logging

#Get a logger specifically for financeHub
logger = logging.getLogger("financehub")

#Allow INFO and higher-severity messages
logger.setLevel(logging.INFO)

#Create a handler that writes logs to file
file_handler = logging.FileHandler(
    "financehub.log",
    mode="a",
    encoding="utf-8"
)

#Configure how each log message looks

formatter = logging.Formatter(
    "%(asctime)s | %(levelname)s | %(message)s"
)

file_handler.setFormatter(formatter)

#Attach the handler to our logger

logger.addHandler(file_handler)