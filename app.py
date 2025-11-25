import streamlit as st
from components import (
    show_cart_screen,
    show_vendor_list_screen,
    show_vendor_detail_screen,
    show_login_screen,
    show_chat_screen,
    show_navigation_screen
)

st.set_page_config(page_title="MarketWay AI App")

def main():
    st.sidebar.title("Navigation")
    choice = st.sidebar.radio("Go to", ["Navigation", "Login", "Vendor List", "Vendor Details", "Cart", "Chat"])

    if choice == "Navigation":
        show_navigation_screen()
    elif choice == "Login":
        show_login_screen()
    elif choice == "Vendor List":
        show_vendor_list_screen()
    elif choice == "Vendor Details":
        show_vendor_detail_screen()
    elif choice == "Cart":
        show_cart_screen()
    elif choice == "Chat":
        show_chat_screen()

if __name__ == "__main__":
    main()
