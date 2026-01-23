"""
Script to generate a dictionary of 5-letter Russian nouns for the game.
It downloads a list of Russian words, filters them using pymorphy2,
and saves the result to prisma/words.json.
"""

import json
import requests
from pathlib import Path
import pymorphy2

# Configuration
WORD_LIST_URL = "https://raw.githubusercontent.com/danakt/russian-words/master/russian.txt"
OUTPUT_FILE = Path(__file__).parent.parent / "prisma" / "words.json"
MIN_LENGTH = 5
MAX_LENGTH = 5

def download_word_list(url: str) -> list[str]:
    """Download the list of words from the given URL."""
    print(f"Downloading word list from {url}...")
    response = requests.get(url)
    response.raise_for_status()
    words = response.text.strip().split('\n')
    print(f"Downloaded {len(words)} words.")
    return words

def filter_words(words: list[str], min_length: int, max_length: int) -> list[str]:
    """Filter words to be of specific length and morphologically verified as nouns."""
    morph = pymorphy2.MorphAnalyzer()
    filtered_words = []
    total_words = len(words)

    print(f"Filtering words for length {min_length}-{max_length} and noun verification...")
    for i, word in enumerate(words):
        # Check length first (fast check)
        if not (min_length <= len(word) <= max_length):
            continue

        # Morphological analysis
        parsed = morph.parse(word)
        if parsed:
            # Check if the main tag indicates a noun in singular, nominative case
            pos_match = 'NOUN' in parsed[0].tag
            case_match = 'nomn' in parsed[0].tag
            number_match = 'sing' in parsed[0].tag

            if pos_match and case_match and number_match:
                filtered_words.append(word.lower())

        # Print progress every 10%
        if (i + 1) % (total_words // 10) == 0:
            print(f"  Processed {i + 1}/{total_words} words...")

    print(f"Filtered down to {len(filtered_words)} words.")
    return filtered_words

def save_words(words: list[str], output_path: Path):
    """Save the list of words to a JSON file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)  # Ensure directory exists
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({"words": words}, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(words)} words to {output_path}")

def main():
    """Main function to orchestrate the dictionary generation."""
    print("Starting dictionary generation...")
    try:
        raw_words = download_word_list(WORD_LIST_URL)
        filtered_words = filter_words(raw_words, MIN_LENGTH, MAX_LENGTH)
        # Remove duplicates while preserving order
        unique_filtered_words = list(dict.fromkeys(filtered_words))
        print(f"Removed duplicates, now {len(unique_filtered_words)} unique words.")
        save_words(unique_filtered_words, OUTPUT_FILE)
        print("Dictionary generation completed successfully!")
    except Exception as e:
        print(f"An error occurred during dictionary generation: {e}")
        raise

if __name__ == "__main__":
    main()