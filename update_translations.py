import json
import os

def update_translations(new_keys):
    locales_dir = r"e:\Ombaye1\vertex\vertexloans\src\locales"
    languages = ['en', 'sw', 'zm']
    
    for lang in languages:
        filepath = os.path.join(locales_dir, f"{lang}.json")
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        def deep_merge(a, b):
            for k, v in b.items():
                if isinstance(v, dict):
                    a[k] = a.get(k, {})
                    deep_merge(a[k], v)
                else:
                    a[k] = v
        
        if lang in new_keys:
            deep_merge(data, new_keys[lang])

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    translations = {
        "en": {
            "auth": {
                "welcome_back": "Welcome back",
                "sign_in_desc": "Sign in to access your dashboard",
                "email_label": "Email Address",
                "email_placeholder": "you@example.com",
                "password_label": "Password",
                "password_placeholder": "Enter your password",
                "forgot_password": "Forgot password?",
                "signing_in": "Signing in...",
                "sign_in": "Sign In",
                "no_account": "Don't have an account?",
                "create_free": "Create one free →",
                "free_to_join": "Free to Join",
                "create_account": "Create your account",
                "start_loan_app": "Start your loan application in minutes",
                "full_name": "Full Name",
                "full_name_placeholder": "John Kamau",
                "phone_label": "Phone Number (optional)",
                "create_password": "Create a strong password",
                "i_agree": "I agree to the",
                "terms": "Terms & Conditions",
                "acknowledge": "and acknowledge this is a genuine loan application.",
                "creating_account": "Creating account...",
                "create_and_apply": "Create Account & Apply",
                "already_have_account": "Already have an account?",
                "sign_in_arrow": "Sign in →"
            }
        },
        "sw": {
            "auth": {
                "welcome_back": "Karibu tena",
                "sign_in_desc": "Ingia ili kuona dashibodi yako",
                "email_label": "Hifadhi ya Barua Pepe",
                "email_placeholder": "wewe@mfano.com",
                "password_label": "Nenosiri",
                "password_placeholder": "Weka nenosiri lako",
                "forgot_password": "Umesahau nenosiri?",
                "signing_in": "Inaingia...",
                "sign_in": "Ingia",
                "no_account": "Huna akaunti?",
                "create_free": "Unda moja bure →",
                "free_to_join": "Kujiunga ni Bure",
                "create_account": "Unda akaunti yako",
                "start_loan_app": "Anza maombi yako ya mkopo kwa dakika chache",
                "full_name": "Jina Kamili",
                "full_name_placeholder": "Juma Kamwe",
                "phone_label": "Nambari ya Simu (sio lazima)",
                "create_password": "Unda nenosiri lenye nguvu",
                "i_agree": "Ninakubaliana na",
                "terms": "Vigezo & Masharti",
                "acknowledge": "na ninathibitisha kuwa haya ni maombi halisi ya mkopo.",
                "creating_account": "Akaunti inaundwa...",
                "create_and_apply": "Unda Akaunti & Omba",
                "already_have_account": "Tayari una akaunti?",
                "sign_in_arrow": "Ingia →"
            }
        },
        "zm": {
            "auth": {
                "welcome_back": "Welcome back",
                "sign_in_desc": "Sign in to access your dashboard",
                "email_label": "Email Address",
                "email_placeholder": "you@example.com",
                "password_label": "Password",
                "password_placeholder": "Enter your password",
                "forgot_password": "Forgot password?",
                "signing_in": "Signing in...",
                "sign_in": "Sign In",
                "no_account": "Don't have an account?",
                "create_free": "Create one free →",
                "free_to_join": "Free to Join",
                "create_account": "Create your account",
                "start_loan_app": "Start your loan application in minutes",
                "full_name": "Full Name",
                "full_name_placeholder": "John Kamau",
                "phone_label": "Phone Number (optional)",
                "create_password": "Create a strong password",
                "i_agree": "I agree to the",
                "terms": "Terms & Conditions",
                "acknowledge": "and acknowledge this is a genuine loan application.",
                "creating_account": "Creating account...",
                "create_and_apply": "Create Account & Apply",
                "already_have_account": "Already have an account?",
                "sign_in_arrow": "Sign in →"
            }
        }
    }
    update_translations(translations)
    print("Auth translations updated!")
