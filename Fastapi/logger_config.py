import logging

LOG_FILE = "financehub.log"


def configure_logging() -> None:
    """Configure application-wide logging once at startup."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        handlers=[logging.FileHandler(LOG_FILE, mode="a", encoding="utf-8")]
    )


configure_logging()