from rest_framework import serializers
from .models import Student, AcademicRecord



class AcademicRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AcademicRecord
        fields = [
            'id', 'institution_name', 'course_of_study',
            'current_level', 'cgpa', 'admission_year',
        ]


class StudentSerializer(serializers.ModelSerializer):
    academic_records = AcademicRecordSerializer(many=True, read_only=True)
    has_active_award = serializers.SerializerMethodField()

    class Meta:
        model  = Student
        fields = [
            'user_id', 'email', 'firstname', 'lastname', 'phone_number', 'ward', 'lga',
            'is_verified','gender', 'certificate','passport',
            'active_award', 'has_active_award', 'academic_records',
        ]

    def get_has_active_award(self, obj) -> bool:
        return obj.has_active_award()


class StudentCreateSerializer(serializers.ModelSerializer):
    """Used only when creating a new student profile.

    nin_hash is intentionally NOT writable here: it is derived server-side from the
    raw NIN at registration (accounts.utils.hash_nin) and mirrored onto the Student.
    Exposing it as an input would let a caller set an arbitrary, unverified hash.
    """
    class Meta:
        model  = Student
        fields = [
            'firstname', 'lastname', 'ward', 'lga', 'level', 'cgpa',
            'active_award',
        ]