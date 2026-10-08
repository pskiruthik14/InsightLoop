"""
Privacy & PII Masking Utilities for InsightLoop
Masks emails and phone numbers to safeguard customer privacy according to MSME compliance.
"""
import re
from typing import Optional


def mask_email(email: Optional[str]) -> str:
    if not email or "@" not in email:
        return email or ""
    parts = email.split("@")
    name_part = parts[0]
    domain_part = parts[1]
    if len(name_part) <= 1:
        masked_name = name_part + "***"
    elif len(name_part) == 2:
        masked_name = name_part[0] + "***"
    else:
        masked_name = name_part[0] + "***" + name_part[-1]
    return f"{masked_name}@{domain_part}"


def mask_phone(phone: Optional[str]) -> str:
    if not phone:
        return ""
    digits = re.sub(r'\D', '', phone)
    if len(digits) < 7:
        return phone[:2] + "***" if len(phone) >= 2 else "***"
    # Preserve country code / first 2 digits and last 2 digits
    prefix = phone[:len(phone)-6]
    return f"{prefix}****{phone[-2:]}"


def mask_text_pii(text: str) -> str:
    """Masks emails and phone numbers embedded inside raw feedback text."""
    if not text:
        return ""
    # Mask email regex
    text = re.sub(
        r'([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)',
        lambda m: mask_email(m.group(0)),
        text
    )
    # Mask 10-digit Indian/international phone numbers
    text = re.sub(
        r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
        lambda m: mask_phone(m.group(0)),
        text
    )
    return text
